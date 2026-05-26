import type { Request, Response } from 'express';
import { pool } from '../../services/db';

// 🔧 Fix helper to strip `/api/v1` and normalize uploads
function ensureUploadPath(url?: string): string {
  if (!url) return '';
  let u = String(url);

  // Strip /api/v1 if present
  u = u.replace('/api/v1', '');

  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('/uploads/')) return u;

  const clean = u.startsWith('/') ? u : `/${u}`;
  return clean.startsWith('/uploads/') ? clean : `/uploads${clean}`;
}

type FrameOption = {
  size: string;
  price: number;
  stock?: number;
};

function parseFrameOptions(raw: unknown): FrameOption[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as FrameOption[];
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as FrameOption[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeFrameOptionsForResponse(raw: unknown): FrameOption[] {
  const opts = parseFrameOptions(raw);
  return Array.isArray(opts) ? opts : [];
}

function validateAndNormalizeFrameOptions(
  category: string | undefined,
  frameOptions: unknown
): { normalized: FrameOption[] | null; error?: string } {
  // Only picture-frames products use frameOptions;
  // for all other categories we ignore and persist NULL for full backward compatibility.
  if (category !== 'picture-frames') {
    return { normalized: null };
  }

  if (frameOptions == null) {
    // To avoid breaking existing data, treat missing frameOptions as "no sizes"
    // while allowing the request. The dashboard will handle enforcing sizes in UI.
    return { normalized: [] };
  }

  const list = Array.isArray(frameOptions) ? frameOptions : [];
  const normalized: FrameOption[] = [];
  const seenSizes = new Set<string>();

  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const anyRaw = raw as any;
    const size = String(anyRaw.size ?? '').trim();
    if (!size) {
      return { normalized: [], error: 'Each frame size must have a non-empty size value.' };
    }
    if (seenSizes.has(size.toLowerCase())) {
      return { normalized: [], error: 'Duplicate frame sizes are not allowed.' };
    }
    const priceNum = Number(anyRaw.price);
    const stockNum = anyRaw.stock == null || anyRaw.stock === '' ? undefined : Number(anyRaw.stock);

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return { normalized: [], error: 'Frame size price must be a number greater than or equal to 0.' };
    }
    if (stockNum != null && (!Number.isInteger(stockNum) || stockNum < 0)) {
      return { normalized: [], error: 'Frame size stock must be an integer greater than or equal to 0.' };
    }

    seenSizes.add(size.toLowerCase());
    normalized.push({
      size,
      price: priceNum,
      stock: stockNum,
    });
  }

  return { normalized, error: undefined };
}

export async function listProducts(req: Request, res: Response) {
  const { category, q } = req.query as { category?: string; q?: string };
  const params: any[] = [];
  let sql =
    'SELECT id, name, description, price, image_url AS imageUrl, category, created_at AS createdAt, updated_at AS updatedAt, gallery, frame_options AS frameOptions FROM product';
  const clauses: string[] = [];
  if (category) { clauses.push('category = ?'); params.push(category); }
  if (q) { clauses.push('name LIKE ?'); params.push(`%${q}%`); }
  if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT 50';
  const [rows] = await pool.query(sql, params);
  const list = Array.isArray(rows) ? (rows as any[]) : [];
  const transformed = list.map((item) => ({
    ...item,
    frameOptions: normalizeFrameOptionsForResponse(item.frameOptions ?? item.frame_options),
  }));
  res.json(transformed);
}

export async function getProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const [rows] = await pool.query(
      'SELECT id, name, description, price, image_url, category, gallery, frame_options, created_at, updated_at FROM product WHERE id = ?',
      [id]
    );
    
    const item = Array.isArray(rows) ? (rows as any[])[0] : null;
    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Parse gallery
    let parsedGallery = item.gallery;
    if (typeof item.gallery === 'string') {
      try {
        parsedGallery = JSON.parse(item.gallery);
      } catch {
        parsedGallery = [];
      }
    }

    if (Array.isArray(parsedGallery)) {
      parsedGallery = parsedGallery.map((g: string) => ensureUploadPath(g));
    }
    
    // Normalize image url
    let primaryImageUrl = ensureUploadPath(item.image_url);
    if (!primaryImageUrl && Array.isArray(parsedGallery) && parsedGallery.length > 0) {
      primaryImageUrl = parsedGallery[0];
    }
    
    const response = {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: primaryImageUrl,
      category: item.category,
      gallery: parsedGallery,
      frameOptions: normalizeFrameOptionsForResponse(item.frame_options),
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
}

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description,
      price,
      category,
      imageUrl,
      image_url,
      gallery,
      frameOptions,
    } = req.body;

    let finalImageUrl = imageUrl || image_url;
    if (!finalImageUrl && gallery && Array.isArray(gallery) && gallery.length > 0) {
      finalImageUrl = gallery[0];
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { normalized: normalizedFrameOptions, error } = validateAndNormalizeFrameOptions(
      category,
      frameOptions
    );
    if (error) {
      return res.status(400).json({ message: error });
    }

    const frameOptionsJson =
      normalizedFrameOptions && normalizedFrameOptions.length > 0
        ? JSON.stringify(normalizedFrameOptions)
        : null;

    const [result] = await pool.query(
      `INSERT INTO product (name, description, price, category, image_url, gallery, frame_options, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, description, price, category, finalImageUrl, JSON.stringify(gallery || []), frameOptionsJson]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.query('SELECT * FROM product WHERE id = ?', [insertId]);
    const product = Array.isArray(rows) ? (rows as any[])[0] : rows;

    res.status(201).json({ 
      message: "Product created successfully", 
      productId: insertId,
      id: insertId,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: ensureUploadPath(product.image_url),
      gallery: Array.isArray(product.gallery)
        ? product.gallery.map((g: string) => ensureUploadPath(g))
        : [],
      frameOptions: normalizeFrameOptionsForResponse(product.frame_options),
      createdAt: product.created_at,
      updatedAt: product.updated_at
    });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: "Error creating product", error: err });
  }
};

// Get all products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query =
      'SELECT id, name, description, price, image_url, category, gallery, frame_options, created_at, updated_at FROM product';
    let params: any[] = [];

    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), offset);

    const [rows] = await pool.query(query, params);

    const transformedRows = Array.isArray(rows)
      ? (rows as any[]).map((item) => {
          let parsedGallery = item.gallery;
          if (typeof item.gallery === 'string') {
            try {
              parsedGallery = JSON.parse(item.gallery);
            } catch {
              parsedGallery = [];
            }
          }

          if (Array.isArray(parsedGallery)) {
            parsedGallery = parsedGallery.map((g: string) => ensureUploadPath(g));
          }

          let primaryImageUrl = ensureUploadPath(item.image_url);
          if (!primaryImageUrl && Array.isArray(parsedGallery) && parsedGallery.length > 0) {
            primaryImageUrl = parsedGallery[0];
          }

          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: primaryImageUrl,
            category: item.category,
            gallery: parsedGallery,
            frameOptions: normalizeFrameOptionsForResponse(item.frame_options),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
        })
      : [];

    res.json(transformedRows);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: "Error fetching products", error: err });
  }
};

// Get product by slug
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM product WHERE slug = ?', [slug]);

    if ((rows as any).length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const item = (rows as any)[0];
    let parsedGallery = item.gallery;
    if (typeof item.gallery === 'string') {
      try {
        parsedGallery = JSON.parse(item.gallery);
      } catch {
        parsedGallery = [];
      }
    }
    if (Array.isArray(parsedGallery)) {
      parsedGallery = parsedGallery.map((g: string) => ensureUploadPath(g));
    }

    res.json({
      ...item,
      imageUrl: ensureUploadPath(item.image_url),
      gallery: parsedGallery,
      frameOptions: normalizeFrameOptionsForResponse(item.frame_options),
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: "Error fetching product", error: err });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, gallery, frameOptions } = req.body;

    const { normalized: normalizedFrameOptions, error } = validateAndNormalizeFrameOptions(
      category,
      frameOptions
    );
    if (error) {
      return res.status(400).json({ message: error });
    }

    const frameOptionsJson =
      normalizedFrameOptions && normalizedFrameOptions.length > 0
        ? JSON.stringify(normalizedFrameOptions)
        : null;

    await pool.query(
      `UPDATE product 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, gallery = ?, frame_options = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, price, category, image_url, JSON.stringify(gallery || []), frameOptionsJson, id]
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: "Error updating product", error: err });
  }
};

// =============================
// Product Reviews / Ratings
// =============================

export const listProductReviews = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const [rows] = await pool.query(
      `SELECT id, product_id AS productId, user_id AS userId, rating, content, size, created_at AS createdAt
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [productId]
    );

    const reviews = Array.isArray(rows) ? rows as any[] : [];
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount;

    res.json({
      reviews,
      averageRating: Number(averageRating.toFixed(2)),
      reviewCount,
    });
  } catch (err) {
    console.error('Error listing product reviews:', err);
    res.status(500).json({ message: 'Error fetching product reviews' });
  }
};

export const createProductReview = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    if (Number.isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const userId = (req as any).user?.id as number | undefined;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { rating, content, size } = req.body as {
      rating?: number;
      content?: string;
      size?: string;
    };

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    if (content && typeof content === 'string' && content.length > 1000) {
      return res.status(400).json({ message: 'Review content is too long (max 1000 characters)' });
    }

    const sizeLabel =
      typeof size === 'string' && size.trim().length > 0 ? size.trim().slice(0, 50) : null;

    // Ensure product exists
    const [productRows] = await pool.query('SELECT id FROM product WHERE id = ? LIMIT 1', [productId]);
    const list = productRows as any[];
    if (!list.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, content, size, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [productId, userId, numericRating, content || null, sizeLabel,]
    );

    // Return updated stats + last few reviews
    const [rows] = await pool.query(
      `SELECT id, product_id AS productId, user_id AS userId, rating, content, size, created_at AS createdAt
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`,
      [productId]
    );

    const reviews = Array.isArray(rows) ? rows as any[] : [];
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? 0
        : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount;

    res.status(201).json({
      message: 'Review submitted successfully',
      reviews,
      averageRating: Number(averageRating.toFixed(2)),
      reviewCount,
    });
  } catch (err) {
    console.error('Error creating product review:', err);
    res.status(500).json({ message: 'Error creating review' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM product WHERE id = ?", [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: "Error deleting product", error: err });
  }
};
