import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from './addresses.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/addresses - Get all user addresses
router.get('/', getUserAddresses);

// POST /api/addresses - Add new address
router.post('/', addAddress);

// PUT /api/addresses/:id - Update address
router.put('/:id', updateAddress);

// DELETE /api/addresses/:id - Delete address
router.delete('/:id', deleteAddress);

// PATCH /api/addresses/:id/default - Set default address
router.patch('/:id/default', setDefaultAddress);

export default router;
