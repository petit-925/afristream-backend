import { Router } from 'express';
import { listPosts, createPost, getBlogStats } from './blog.controller';

export const router = Router();

router.get('/', listPosts);
router.get('/stats', getBlogStats);
router.post('/', createPost);

