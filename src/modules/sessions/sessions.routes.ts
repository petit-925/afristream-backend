import { Router } from 'express';
import { authenticate } from '../../common/middleware/auth';
import {
  getUserSessions,
  logoutSession,
  logoutAllOtherSessions,
  toggleTwoFactor
} from './sessions.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/sessions - Get user sessions
router.get('/', getUserSessions);

// DELETE /api/sessions/:id - Log out from specific session
router.delete('/:id', logoutSession);

// DELETE /api/sessions - Log out from all other sessions
router.delete('/', logoutAllOtherSessions);

// POST /api/sessions/2fa/toggle - Toggle Two-Factor Authentication
router.post('/2fa/toggle', toggleTwoFactor);

export default router;
