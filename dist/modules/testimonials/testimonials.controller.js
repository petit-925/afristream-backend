"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTestimonials = listTestimonials;
exports.getTestimonialStats = getTestimonialStats;
const db_1 = require("../../services/db");
async function listTestimonials(_req, res) {
    const [rows] = await db_1.pool.query("SELECT id, user_id AS userId, name, company, content, rating, status, featured, created_at AS createdAt, updated_at AS updatedAt FROM testimonial WHERE status = 'approved' ORDER BY created_at DESC");
    res.json(rows);
}
async function getTestimonialStats(_req, res) {
    try {
        const [rows] = await db_1.pool.query('SELECT * FROM testimonial');
        const testimonials = Array.isArray(rows) ? rows : [];
        const totalReviews = testimonials.length;
        const approvedReviews = testimonials.filter((t) => (t.status || 'approved') === 'approved').length;
        const pendingApproval = testimonials.filter((t) => t.status === 'pending').length;
        const featured = testimonials.filter((t) => !!t.featured).length;
        const averageRating = testimonials.length ?
            (testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length).toFixed(1) :
            '0.0';
        res.json({
            totalReviews,
            approvedReviews,
            pendingApproval,
            featured,
            averageRating: parseFloat(averageRating)
        });
    }
    catch (error) {
        console.error('Error fetching testimonial stats:', error);
        res.status(500).json({ message: 'Error fetching testimonial stats' });
    }
}
