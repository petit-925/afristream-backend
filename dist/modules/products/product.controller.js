"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.createProductReview = exports.listProductReviews = exports.updateProduct = exports.getProductBySlug = exports.getProducts = exports.createProduct = void 0;
exports.listProducts = listProducts;
exports.getProduct = getProduct;
const db_1 = require("../../services/db");
// 🔧 Fix helper to strip `/api/v1` and normalize uploads
function ensureUploadPath(url) {
    if (!url)
        return '';
    let u = String(url);
    // Strip /api/v1 if present
    u = u.replace('/api/v1', '');
    if (/^https?:\/\//i.test(u) || u.startsWith('data:'))
        return u;
    if (u.startsWith('/uploads/'))
        return u;
    const clean = u.startsWith('/') ? u : `/${u}`;
    return clean.startsWith('/uploads/') ? clean : `/uploads${clean}`;
}
function parseFrameOptions(raw) {
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    return [];
}
function normalizeFrameOptionsForResponse(raw) {
    const opts = parseFrameOptions(raw);
    return Array.isArray(opts) ? opts : [];
}
function validateAndNormalizeFrameOptions(category, frameOptions) {
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
    const normalized = [];
    const seenSizes = new Set();
    for (const raw of list) {
        if (!raw || typeof raw !== 'object')
            continue;
        const anyRaw = raw;
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
async function listProducts(req, res) {
    const { category, q } = req.query;
    const params = [];
    let sql = 'SELECT id, name, description, price, image_url AS imageUrl, category, created_at AS createdAt, updated_at AS updatedAt, gallery, frame_options AS frameOptions FROM product';
    const clauses = [];
    if (category) {
        clauses.push('category = ?');
        params.push(category);
    }
    if (q) {
        clauses.push('name LIKE ?');
        params.push(`%${q}%`);
    }
    if (clauses.length)
        sql += ' WHERE ' + clauses.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT 50';
    const [rows] = await db_1.pool.query(sql, params);
    const list = Array.isArray(rows) ? rows : [];
    const transformed = list.map((item) => ({
        ...item,
        frameOptions: normalizeFrameOptionsForResponse(item.frameOptions ?? item.frame_options),
    }));
    res.json(transformed);
}
async function getProduct(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const [rows] = await db_1.pool.query('SELECT id, name, description, price, image_url, category, gallery, frame_options, created_at, updated_at FROM product WHERE id = ?', [id]);
        const item = Array.isArray(rows) ? rows[0] : null;
        if (!item) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Parse gallery
        let parsedGallery = item.gallery;
        if (typeof item.gallery === 'string') {
            try {
                parsedGallery = JSON.parse(item.gallery);
            }
            catch {
                parsedGallery = [];
            }
        }
        if (Array.isArray(parsedGallery)) {
            parsedGallery = parsedGallery.map((g) => ensureUploadPath(g));
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
    }
    catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product', error });
    }
}
// Create product
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl, image_url, gallery, frameOptions, } = req.body;
        let finalImageUrl = imageUrl || image_url;
        if (!finalImageUrl && gallery && Array.isArray(gallery) && gallery.length > 0) {
            finalImageUrl = gallery[0];
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { normalized: normalizedFrameOptions, error } = validateAndNormalizeFrameOptions(category, frameOptions);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const frameOptionsJson = normalizedFrameOptions && normalizedFrameOptions.length > 0
            ? JSON.stringify(normalizedFrameOptions)
            : null;
        const [result] = await db_1.pool.query(`INSERT INTO product (name, description, price, category, image_url, gallery, frame_options, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [name, description, price, category, finalImageUrl, JSON.stringify(gallery || []), frameOptionsJson]);
        const insertId = result.insertId;
        const [rows] = await db_1.pool.query('SELECT * FROM product WHERE id = ?', [insertId]);
        const product = Array.isArray(rows) ? rows[0] : rows;
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
                ? product.gallery.map((g) => ensureUploadPath(g))
                : [],
            frameOptions: normalizeFrameOptionsForResponse(product.frame_options),
            createdAt: product.created_at,
            updatedAt: product.updated_at
        });
    }
    catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: "Error creating product", error: err });
    }
};
exports.createProduct = createProduct;
// Get all products
const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = 'SELECT id, name, description, price, image_url, category, gallery, frame_options, created_at, updated_at FROM product';
        let params = [];
        if (category) {
            query += " WHERE category = ?";
            params.push(category);
        }
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(Number(limit), offset);
        const [rows] = await db_1.pool.query(query, params);
        const transformedRows = Array.isArray(rows)
            ? rows.map((item) => {
                let parsedGallery = item.gallery;
                if (typeof item.gallery === 'string') {
                    try {
                        parsedGallery = JSON.parse(item.gallery);
                    }
                    catch {
                        parsedGallery = [];
                    }
                }
                if (Array.isArray(parsedGallery)) {
                    parsedGallery = parsedGallery.map((g) => ensureUploadPath(g));
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
    }
    catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: "Error fetching products", error: err });
    }
};
exports.getProducts = getProducts;
// Get product by slug
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [rows] = await db_1.pool.query('SELECT * FROM product WHERE slug = ?', [slug]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        const item = rows[0];
        let parsedGallery = item.gallery;
        if (typeof item.gallery === 'string') {
            try {
                parsedGallery = JSON.parse(item.gallery);
            }
            catch {
                parsedGallery = [];
            }
        }
        if (Array.isArray(parsedGallery)) {
            parsedGallery = parsedGallery.map((g) => ensureUploadPath(g));
        }
        res.json({
            ...item,
            imageUrl: ensureUploadPath(item.image_url),
            gallery: parsedGallery,
            frameOptions: normalizeFrameOptionsForResponse(item.frame_options),
        });
    }
    catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ message: "Error fetching product", error: err });
    }
};
exports.getProductBySlug = getProductBySlug;
// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, image_url, gallery, frameOptions } = req.body;
        const { normalized: normalizedFrameOptions, error } = validateAndNormalizeFrameOptions(category, frameOptions);
        if (error) {
            return res.status(400).json({ message: error });
        }
        const frameOptionsJson = normalizedFrameOptions && normalizedFrameOptions.length > 0
            ? JSON.stringify(normalizedFrameOptions)
            : null;
        await db_1.pool.query(`UPDATE product 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, gallery = ?, frame_options = ?, updated_at = NOW()
       WHERE id = ?`, [name, description, price, category, image_url, JSON.stringify(gallery || []), frameOptionsJson, id]);
        res.json({ message: "Product updated successfully" });
    }
    catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ message: "Error updating product", error: err });
    }
};
exports.updateProduct = updateProduct;
// =============================
// Product Reviews / Ratings
// =============================
const listProductReviews = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (Number.isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const [rows] = await db_1.pool.query(`SELECT id, product_id AS productId, user_id AS userId, rating, content, size, created_at AS createdAt
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`, [productId]);
        const reviews = Array.isArray(rows) ? rows : [];
        const reviewCount = reviews.length;
        const averageRating = reviewCount === 0
            ? 0
            : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount;
        res.json({
            reviews,
            averageRating: Number(averageRating.toFixed(2)),
            reviewCount,
        });
    }
    catch (err) {
        console.error('Error listing product reviews:', err);
        res.status(500).json({ message: 'Error fetching product reviews' });
    }
};
exports.listProductReviews = listProductReviews;
const createProductReview = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (Number.isNaN(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const { rating, content, size } = req.body;
        const numericRating = Number(rating);
        if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }
        if (content && typeof content === 'string' && content.length > 1000) {
            return res.status(400).json({ message: 'Review content is too long (max 1000 characters)' });
        }
        const sizeLabel = typeof size === 'string' && size.trim().length > 0 ? size.trim().slice(0, 50) : null;
        // Ensure product exists
        const [productRows] = await db_1.pool.query('SELECT id FROM product WHERE id = ? LIMIT 1', [productId]);
        const list = productRows;
        if (!list.length) {
            return res.status(404).json({ message: 'Product not found' });
        }
        await db_1.pool.query(`INSERT INTO product_reviews (product_id, user_id, rating, content, size, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`, [productId, userId, numericRating, content || null, sizeLabel,]);
        // Return updated stats + last few reviews
        const [rows] = await db_1.pool.query(`SELECT id, product_id AS productId, user_id AS userId, rating, content, size, created_at AS createdAt
       FROM product_reviews
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 100`, [productId]);
        const reviews = Array.isArray(rows) ? rows : [];
        const reviewCount = reviews.length;
        const averageRating = reviewCount === 0
            ? 0
            : reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount;
        res.status(201).json({
            message: 'Review submitted successfully',
            reviews,
            averageRating: Number(averageRating.toFixed(2)),
            reviewCount,
        });
    }
    catch (err) {
        console.error('Error creating product review:', err);
        res.status(500).json({ message: 'Error creating review' });
    }
};
exports.createProductReview = createProductReview;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.pool.query("DELETE FROM product WHERE id = ?", [id]);
        res.json({ message: "Product deleted successfully" });
    }
    catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ message: "Error deleting product", error: err });
    }
};
exports.deleteProduct = deleteProduct;
