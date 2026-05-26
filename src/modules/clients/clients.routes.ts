import { Router } from 'express';
import { listClients, createClient } from './clients.controller';

export const router = Router();

router.get('/', listClients);
router.post('/', createClient);

