import type { Request, Response } from 'express';
import type { RowDataPacket } from 'mysql2/promise';
import { pool } from '../../services/db';
import { AppError } from '../../common/errors/AppError';

// Create a cart-style order with items
export async function createOrder(req: Request, res: Response) {
  const {
    items,
    shippingAddress,
    customerEmail,
    customerPhone,
    currency,
    totalAmount,
    deliveryFee,
  } = req.body as {
    items: { productId: number; quantity: number; selectedSize?: string | null }[];
    shippingAddress?: string;
    customerEmail?: string;
    customerPhone?: string;
    currency?: string;
    totalAmount?: number;
    deliveryFee?: number;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided' });
  }

  const now = new Date();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order header
    const [orderResult] = await conn.query(
      'INSERT INTO orders (shipping_address, customer_email, customer_phone, currency, total_amount, delivery_fee, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [shippingAddress || null, customerEmail || null, customerPhone || null, currency || 'GHS', totalAmount || 0, deliveryFee || 0, 'pending', now, now]
    );
    const orderId = (orderResult as any).insertId as number;

    // Insert items and validate products
    for (const it of items) {
      const [prodRows] = await conn.query(
        'SELECT id, price, category, frame_options FROM product WHERE id = ?',
        [it.productId]
      );
      const product = Array.isArray(prodRows) ? (prodRows as any[])[0] : null;
      if (!product) {
        throw new Error(`Invalid product: ${it.productId}`);
      }

      let unitPrice = Number(product.price);
      let selectedSize: string | null = it.selectedSize ?? null;

      // For picture frame products, use per-size price and basic stock validation
      if (product.category === 'picture-frames') {
        const rawFrameOptions = product.frame_options;
        let parsed: any[] = [];
        if (rawFrameOptions) {
          try {
            parsed =
              typeof rawFrameOptions === 'string' ? JSON.parse(rawFrameOptions) : rawFrameOptions;
          } catch {
            parsed = [];
          }
        }

        if (parsed.length > 0) {
          if (!selectedSize) {
            // New behaviour: require a size when options exist, but keep 400 scoped to this item only
            throw new Error(`Missing selected size for picture frame product ${it.productId}`);
          }
          const match = parsed.find(
            (o: any) => String(o.size).toLowerCase() === selectedSize!.toLowerCase()
          );
          if (!match) {
            throw new Error(
              `Invalid selected size "${selectedSize}" for picture frame product ${it.productId}`
            );
          }
          if (match.price != null && Number(match.price) >= 0) {
            unitPrice = Number(match.price);
          }
          if (match.stock != null && Number.isFinite(Number(match.stock))) {
            const sizeStock = Number(match.stock);
            if (sizeStock < it.quantity) {
              throw new Error(
                `Insufficient stock for size "${selectedSize}" of product ${it.productId}`
              );
            }
          }
        }
      }

      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price, selected_size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [orderId, it.productId, it.quantity, unitPrice, selectedSize, now, now]
      );
    }

    await conn.commit();
    const [rows] = await conn.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    res.status(201).json(Array.isArray(rows) ? (rows as any[])[0] : rows);
  } catch (err) {
    await conn.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'Error creating order' });
  } finally {
    conn.release();
  }
}

export async function getOrders(req: Request, res: Response) {
  try {
    const { status, period, search } = req.query as { status?: string; period?: string; search?: string };
    
    let sql = `
      SELECT 
        o.*,
        cu.name as customer_name,
        cu.email as customer_email,
        cu.phone as customer_phone
      FROM orders o
      LEFT JOIN client_users cu ON o.user_id = cu.id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
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
      if (period === '7d') days = 7;
      else if (period === '3m') days = 90;
      
      conditions.push('o.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)');
      params.push(days);
    }
    
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY o.created_at DESC LIMIT 100';
    
    const [rows] = await pool.query(sql, params);
    res.json({ orders: rows });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
}

// =============================================
// NEW USER-SPECIFIC ORDER FUNCTIONS
// =============================================

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.json(rows);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching user orders:', error);
    throw AppError.internal('Failed to fetch user orders', error);
  }
};

// Get single order with items
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Get order details
    const [orderRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orderRows.length === 0) {
      throw AppError.notFound('Order not found or does not belong to user');
    }

    const order = orderRows[0] as any;

    // Get order items with product details
    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi 
       JOIN product p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
      ...order,
      items: itemRows
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error fetching order details:', error);
    throw AppError.internal('Failed to fetch order details', error);
  }
};

// Generate invoice PDF (placeholder - would need PDF generation library)
export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw AppError.unauthorized('User not authenticated');
    }

    const { id } = req.params;

    // Check if order belongs to user
    const [orderRows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orderRows.length === 0) {
      throw AppError.notFound('Order not found or does not belong to user');
    }

    // TODO: Implement PDF generation
    // For now, return order data that could be used for PDF generation
    const order = orderRows[0] as any;

    // Get order items
    const [itemRows] = await pool.query<RowDataPacket[]>(
      `SELECT oi.*, p.name as product_name, p.image_url 
       FROM order_items oi 
       JOIN product p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id]
    );

    res.json({
      message: 'Invoice data ready for PDF generation',
      order: {
        ...order,
        items: itemRows
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error generating invoice:', error);
    throw AppError.internal('Failed to generate invoice', error);
  }
};

