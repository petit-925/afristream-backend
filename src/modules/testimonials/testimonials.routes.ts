import { Router } from 'express';
import { listTestimonials, getTestimonialStats } from './testimonials.controller';

export const router = Router();

router.get('/', listTestimonials);
router.get('/stats', getTestimonialStats);

