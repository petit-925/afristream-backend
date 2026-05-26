import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import { 
  createOrder, 
  getOrders, 
  getUserOrders, 
  getOrderById, 
  generateInvoice 
} from './orders.controller';

export const router = Router();

// Admin routes (existing)
router.get('/', getOrders);
router.post('/', createOrder);

// User-specific routes (new)
router.get('/my-orders', authenticate, getUserOrders);
router.get('/my-orders/:id', authenticate, getOrderById);
router.get('/invoice/:id', authenticate, generateInvoice);

