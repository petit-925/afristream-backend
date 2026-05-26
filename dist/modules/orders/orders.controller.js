"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoice = exports.getOrderById = exports.getUserOrders = void 0;
exports.createOrder = createOrder;
exports.getOrders = getOrders;
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
// Create a cart-style order with items
async function createOrder(req, res) {
    const { items, shippingAddress, customerEmail, customerPhone, currency, totalAmount, deliveryFee, } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'No items provided' });
    }
    const now = new Date();
    const conn = await db_1.pool.getConnection();
    try {
        await conn.beginTransaction();
        // Insert order header
        const [orderResult] = await conn.query('INSERT INTO orders (shipping_address, customer_email, customer_phone, currency, total_amount, delivery_fee, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [shippingAddress || null, customerEmail || null, customerPhone || null, currency || 'GHS', totalAmount || 0, deliveryFee || 0, 'pending', now, now]);
        const orderId = orderResult.insertId;
        // Insert items and validate products
        for (const it of items) {
            const [prodRows] = await conn.query('SELECT id, price, category, frame_options FROM product WHERE id = ?', [it.productId]);
            const product = Array.isArray(prodRows) ? prodRows[0] : null;
            if (!product) {
                throw new Error(`Invalid product: ${it.productId}`);
            }
            let unitPrice = Number(product.price);
            let selectedSize = it.selectedSize ?? null;
            // For picture frame products, use per-size price and basic stock validation
            if (product.category === 'picture-frames') {
                const rawFrameOptions = product.frame_options;
                let parsed = [];
                if (rawFrameOptions) {
                    try {
                        parsed =
                            typeof rawFrameOptions === 'string' ? JSON.parse(rawFrameOptions) : rawFrameOptions;
                    }
                    catch {
                        parsed = [];
                    }
                }
                if (parsed.length > 0) {
                    if (!selectedSize) {
                        // New behaviour: require a size when options exist, but keep 400 scoped to this item only
                        throw new Error(`Missing selected size for picture frame product ${it.productId}`);
                    }
                    const match = parsed.find((o) => String(o.size).toLowerCase() === selectedSize.toLowerCase());
                    if (!match) {
                        throw new Error(`Invalid selected size "${selectedSize}" for picture frame product ${it.productId}`);
                    }
                    if (match.price != null && Number(match.price) >= 0) {
                        unitPrice = Number(match.price);
                    }
                    if (match.stock != null && Number.isFinite(Number(match.stock))) {
                        const sizeStock = Number(match.stock);
                        if (sizeStock < it.quantity) {
                            throw new Error(`Insufficient stock for size "${selectedSize}" of product ${it.productId}`);
                        }
                    }
                }
            }
            await conn.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price, selected_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [orderId, it.productId, it.quantity, unitPrice, selectedSize, now, now]);
        }
        await conn.commit();
        const [rows] = await conn.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        res.status(201).json(Array.isArray(rows) ? rows[0] : rows);
    }
    catch (err) {
        await conn.rollback();
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order' });
    }
    finally {
        conn.release();
    }
}
async function getOrders(req, res) {
    try {
        const { status, period, search } = req.query;
        let sql = `
      SELECT 
        o.*,
        cu.name as customer_name,
        cu.email as customer_email,
        cu.phone as customer_phone
      FROM orders o
      LEFT JOIN client_users cu ON o.user_id = cu.id
    `;
        const conditions = [];
        const params = [];
        if (status && status !== 'all') {
            conditions.push('o.status = ?');
            params.push(status);
        }
        if (search) {
            conditions.push('(cu.name LIKE ? OR cu.email LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }
        if (period && period !== 'all') {
            let days = 30;
            if (period === '7d')
                days = 7;
            else if (period === '3m')
                days = 90;
            conditions.push('o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)');
            params.push(days);
        }
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY o.created_at DESC LIMIT 100';
        const [rows] = await db_1.pool.query(sql, params);
        res.json({ orders: rows });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
}
// =============================================
// NEW USER-SPECIFIC ORDER FUNCTIONS
// =============================================
// Get user's orders
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const [rows] = await db_1.pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(rows);
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching user orders:', error);
        throw AppError_1.AppError.internal('Failed to fetch user orders', error);
    }
};
exports.getUserOrders = getUserOrders;
// Get single order with items
const getOrderById = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Get order details
        const [orderRows] = await db_1.pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
        if (orderRows.length === 0) {
            throw AppError_1.AppError.notFound('Order not found or does not belong to user');
        }
        const order = orderRows[0];
        // Get order items with product details
        const [itemRows] = await db_1.pool.query(`SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi 
       JOIN product p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`, [id]);
        res.json({
            ...order,
            items: itemRows
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error fetching order details:', error);
        throw AppError_1.AppError.internal('Failed to fetch order details', error);
    }
};
exports.getOrderById = getOrderById;
// Generate invoice PDF (placeholder - would need PDF generation library)
const generateInvoice = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw AppError_1.AppError.unauthorized('User not authenticated');
        }
        const { id } = req.params;
        // Check if order belongs to user
        const [orderRows] = await db_1.pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [id, userId]);
        if (orderRows.length === 0) {
            throw AppError_1.AppError.notFound('Order not found or does not belong to user');
        }
        // TODO: Implement PDF generation
        // For now, return order data that could be used for PDF generation
        const order = orderRows[0];
        // Get order items
        const [itemRows] = await db_1.pool.query(`SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi 
       JOIN product p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`, [id]);
        res.json({
            message: 'Invoice data ready for PDF generation',
            order: {
                ...order,
                items: itemRows
            }
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        console.error('Error generating invoice:', error);
        throw AppError_1.AppError.internal('Failed to generate invoice', error);
    }
};
exports.generateInvoice = generateInvoice;
