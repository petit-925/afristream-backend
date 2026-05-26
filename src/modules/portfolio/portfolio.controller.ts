import { Request, Response } from "express";
import { pool } from "../../services/db";

function ensureUploadPath(url?: string): string {
  if (!url) return '';
  let u = String(url);

  // 🔥 Strip `/api/v1` if present in absolute or relative paths
  u = u.replace('/api/v1', '');

  if (/^https?:\/\//i.test(u) || u.startsWith('data:')) return u;
  if (u.startsWith('/uploads/')) return u;

  const clean = u.startsWith('/') ? u : `/${u}`;
  return clean.startsWith('/uploads/') ? clean : `/uploads${clean}`;
}


function mapPortfolioRow(row: any) {
  const parseJson = (v: any, fallback: any) => {
    try { if (v == null) return fallback; const s = typeof v === 'string' ? v : JSON.stringify(v); return JSON.parse(s); } catch { return fallback; }
  };
  const gallery = parseJson(row.gallery, [] as string[]).map((g: string) => ensureUploadPath(g));
  const media = row.mediaURL || row.media_u_r_l || row.mediaUrl || '';
  return {
    ...row,
    mediaURL: ensureUploadPath(media),
    tags: parseJson(row.tags, []),
    features: parseJson(row.features, []),
    testimonial: parseJson(row.testimonial, null),
    gallery,
  };
}

// Create portfolio
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const { title, description, category, client, location, date, overview, mediaURL } = req.body as any;
    let { images, gallery, tags, features, testimonial } = req.body as any;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // Normalize images from various possible payload keys
    // Collect gallery from multiple possible props
    const collected: string[] = [];
    const pushAll = (arr: any) => { if (Array.isArray(arr)) for (const x of arr) if (typeof x === 'string' && x) collected.push(x); };
    pushAll(images);
    pushAll(gallery);
    pushAll((req.body as any).files);
    pushAll((req.body as any).imageUrls);
    const uniqueGallery = Array.from(new Set(collected.filter((u) => typeof u === 'string' && u).map((u: string) => ensureUploadPath(u))));
    const preferNonData = (u?: string) => (u && !u.startsWith('data:') ? u : '');
    const primaryCandidate = ensureUploadPath(preferNonData(mediaURL)) || preferNonData(uniqueGallery.find(u => u.startsWith('/uploads') || /^https?:\/\//i.test(u))) || '';
    const primary = primaryCandidate.length > 250 ? primaryCandidate.slice(0, 250) : primaryCandidate;

    // Normalize tags/features/testimonial to JSON strings as required by schema
    const normalizedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? [tags] : []);
    const tagsJson = JSON.stringify(normalizedTags);
    const featuresJson = JSON.stringify(Array.isArray(features) ? features : (features ? [features] : []));
    const testimonialJson = JSON.stringify(testimonial && typeof testimonial === 'object' ? testimonial : (testimonial ? { quote: String(testimonial) } : {}));
    const galleryJson = JSON.stringify(uniqueGallery);

    // Authenticated user id
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const [result] = await pool.query(
      `INSERT INTO portfolio (
        title, description, category, tags, media_type, created_at, updated_at,
        user_id, media_u_r_l, client, location, date, overview, features, testimonial, gallery
      ) VALUES (
        ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        title,
        description,
        category || 'branding',
        tagsJson,
        'image',
        userId,
        primary,
        client || null,
        location || null,
        date || null,
        overview || null,
        featuresJson,
        testimonialJson,
        galleryJson,
      ]
    );

    res.json({ message: "Portfolio item created", portfolioId: (result as any).insertId });
  } catch (err: any) {
    console.error(err);
    const detail = err?.sqlMessage || err?.message || 'Error creating portfolio';
    res.status(500).json({ message: "Error creating portfolio", detail });
  }
};

// Get all portfolio
export const getPortfolio = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM portfolio ORDER BY created_at DESC");
    const list = Array.isArray(rows) ? (rows as any[]).map(mapPortfolioRow) : [];
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};

// Get portfolio by slug
export const getPortfolioBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query("SELECT * FROM portfolio WHERE slug = ?", [slug]);

    if ((rows as any).length === 0) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    res.json(mapPortfolioRow((rows as any)[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};

// Get portfolio by numeric id (frontend uses /portfolio/:id)
export const getPortfolioById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const [rows] = await pool.query("SELECT * FROM portfolio WHERE id = ?", [Number(id)]);
    if ((rows as any).length === 0) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(mapPortfolioRow((rows as any)[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching portfolio" });
  }
};

// Delete portfolio
export const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM portfolio WHERE id = ?", [id]);
    res.json({ message: "Portfolio item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting portfolio" });
  }
};

// Update portfolio
export const updatePortfolio = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as any;
    const {
      title,
      description,
      category,
      client,
      location,
      date,
      overview,
      mediaURL,
      features,
      testimonial,
      tags,
      gallery,
    } = req.body as any;

    // Normalize arrays/objects into JSON strings
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map((t) => t.trim()) : []));
    const featuresJson = JSON.stringify(Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter((s) => s.trim()) : []));
    const testimonialJson = JSON.stringify(testimonial && typeof testimonial === 'object' ? testimonial : (testimonial ? { quote: String(testimonial) } : {}));
    const galleryList: string[] = Array.isArray(gallery) ? gallery : (typeof gallery === 'string' ? (() => { try { const g = JSON.parse(gallery); return Array.isArray(g) ? g : []; } catch { return []; } })() : []);
    const normalizedGallery = galleryList.map((g) => ensureUploadPath(g));
    const primary = ensureUploadPath(mediaURL);

    await pool.query(
      `UPDATE portfolio SET 
        title = ?,
        description = ?,
        category = ?,
        client = ?,
        location = ?,
        date = ?,
        overview = ?,
        media_u_r_l = ?,
        features = ?,
        testimonial = ?,
        tags = ?,
        gallery = ?,
        updated_at = NOW()
      WHERE id = ?`,
      [
        title,
        description,
        category,
        client || null,
        location || null,
        date || null,
        overview || null,
        primary || null,
        featuresJson,
        testimonialJson,
        tagsJson,
        JSON.stringify(normalizedGallery),
        Number(id),
      ]
    );

    res.json({ message: 'Portfolio updated successfully' });
  } catch (err: any) {
    console.error('Error updating portfolio:', err);
    const detail = err?.sqlMessage || err?.message || 'Error updating portfolio';
    res.status(500).json({ message: 'Error updating portfolio', detail });
  }
};
