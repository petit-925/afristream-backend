import { Router } from 'express';
import { listMessages, createMessage, markMessageRead, toggleMessageStar } from './messages.controller';
import { authenticate } from '../../common/middleware/auth';

export const router = Router();

router.get('/', listMessages);
router.post('/', createMessage);
router.put('/:id/read', authenticate, markMessageRead);
router.put('/:id/star', authenticate, toggleMessageStar);

