import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';

export const router = Router();

router.get('/', getSettings);
router.put('/', updateSettings);

