import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  renameWishlistList,
  toggleWishlistShare,
  getSharedWishlist,
} from './wishlist.controller';

const router = Router();

// Public shared list access
router.get('/shared/:token', getSharedWishlist);

// All routes below require authentication
router.use(authenticate);

// GET /api/wishlist - Get user wishlist (grouped by lists)
router.get('/', getUserWishlist);

// POST /api/wishlist - Add item to wishlist (optional listName)
router.post('/', addToWishlist);

// PATCH /api/wishlist/list - Rename list
router.patch('/list', renameWishlistList);

// POST /api/wishlist/list/share - Enable/disable sharing for a list
router.post('/list/share', toggleWishlistShare);

// DELETE /api/wishlist/:id - Remove item from wishlist
router.delete('/:id', removeFromWishlist);

// DELETE /api/wishlist - Clear entire wishlist
router.delete('/', clearWishlist);

export default router;
