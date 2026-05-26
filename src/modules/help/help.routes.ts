import { Router } from 'express';
import { getHelpArticles, getHelpArticle } from './help.controller';

export const router = Router();

router.get('/', getHelpArticles);
router.get('/:id', getHelpArticle);

