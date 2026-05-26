import type { Request, Response } from 'express';
import { pool } from '../../services/db';

export async function listTestimonials(_req: Request, res: Response) {
  const [rows] = await pool.query(
    "SELECT id, user_id AS userId, name, company, content, rating, status, featured, created_at AS createdAt, updated_at AS updatedAt FROM testimonial WHERE status = 'approved' ORDER BY created_at DESC"
  );
  res.json(rows);
}

export async function getTestimonialStats(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query('SELECT * FROM testimonial');
    const testimonials = Array.isArray(rows) ? rows : [];
    
    const totalReviews = testimonials.length;
    const approvedReviews = testimonials.filter((t: any) => (t.status || 'approved') === 'approved').length;
    const pendingApproval = testimonials.filter((t: any) => t.status === 'pending').length;
    const featured = testimonials.filter((t: any) => !!t.featured).length;
    const averageRating = testimonials.length ? 
      (testimonials.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1) : 
      '0.0';
    
    res.json({
      totalReviews,
      approvedReviews,
      pendingApproval,
      featured,
      averageRating: parseFloat(averageRating)
    });
  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    res.status(500).json({ message: 'Error fetching testimonial stats' });
  }
}

