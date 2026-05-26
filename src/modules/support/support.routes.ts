import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import {
  getUserTickets,
  getTicketById,
  createTicket,
  updateTicket
} from './support.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/support/tickets - Get user support tickets
router.get('/tickets', getUserTickets);

// GET /api/support/tickets/:id - Get single support ticket
router.get('/tickets/:id', getTicketById);

// POST /api/support/tickets - Create new support ticket
router.post('/tickets', createTicket);

// PUT /api/support/tickets/:id - Update support ticket
router.put('/tickets/:id', updateTicket);

export default router;
