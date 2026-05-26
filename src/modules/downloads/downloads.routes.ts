import { Router } from 'express';
import { listDownloads, createDownload } from './downloads.controller';

export const router = Router();

router.get('/', listDownloads);
router.post('/', createDownload);

