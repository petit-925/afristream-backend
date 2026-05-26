import type { Request, Response } from 'express';
import { pool } from '../../services/db';

export async function listPosts(_req: Request, res: Response) {
  const [rows] = await pool.query(
    'SELECT id, user_id AS user_id, title, content, created_at AS created_at, updated_at AS updated_at FROM blog_posts ORDER BY created_at DESC'
  );
  res.json(rows);
}

export async function createPost(req: Request, res: Response) {
  const { user_id, title, content } = req.body as { user_id: number; title: string; content: string };
  const now = new Date();
  const [result] = await pool.query(
    'INSERT INTO blog_posts (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [user_id, title, content, now, now]
  );
  const insertId = (result as any).insertId;
  const [rows] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [insertId]);
  res.status(201).json(Array.isArray(rows) ? (rows as any[])[0] : rows);
}

export async function getBlogStats(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM blog_posts');
    const posts = Array.isArray(rows) ? rows : [];
    
    const totalPosts = posts.length;
    const publishedPosts = posts.filter((p: any) => (p.status || '').toLowerCase() === 'published').length;
    const draftPosts = posts.filter((p: any) => (p.status || '').toLowerCase() === 'draft').length;
    const scheduledPosts = posts.filter((p: any) => (p.status || '').toLowerCase() === 'scheduled').length;
    const totalViews = posts.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    
    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      scheduledPosts,
      totalViews
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ message: 'Error fetching blog stats' });
  }
}

