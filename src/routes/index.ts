import { Router } from 'express';
import { authenticate } from '../common/middleware/auth';
import { router as authRouter } from '../modules/auth/auth.routes';
import { router as clientAuthRouter } from '../modules/auth/client.auth.routes';
import productsRouter from '../modules/products/product.routes';
import { router as ordersRouter } from '../modules/orders/orders.routes';
import { router as paymentsRouter } from '../modules/payments/payments.routes';
import categoriesRouter from '../modules/categories/categories.routes';
import portfolioRouter from '../modules/portfolio/portfolio.routes';
import { router as testimonialsRouter } from '../modules/testimonials/testimonials.routes';
import { router as blogRouter } from '../modules/blog/blog.routes';
import { router as helpRouter } from '../modules/help/help.routes';
import { router as downloadsRouter } from '../modules/downloads/downloads.routes';
import { router as messagesRouter } from '../modules/messages/messages.routes';
import { router as clientsRouter } from '../modules/clients/clients.routes';
import uploadRoutes from './upload.routes';
import { router as usersRouter } from '../modules/users/users.routes';
import { router as settingsRouter } from '../modules/settings/settings.routes';
import addressesRouter from '../modules/addresses/addresses.routes';
import wishlistRouter from '../modules/wishlist/wishlist.routes';
import sessionsRouter from '../modules/sessions/sessions.routes';
import supportRouter from '../modules/support/support.routes';
import { pool } from '../services/db';

export const router = Router();

// Public routes
router.use('/auth', authRouter);
router.use('/client/auth', clientAuthRouter);
router.use('/products', productsRouter);
router.use('/categories', categoriesRouter);
router.use('/portfolio', portfolioRouter);
router.use('/testimonials', testimonialsRouter);
router.use('/blog', blogRouter);
router.use('/downloads', downloadsRouter);
router.use('/help', helpRouter);

// Lightweight public analytics endpoint (placeholder)
router.get('/analytics', (_req, res) => {
  return res.json({
    revenue: { total: 0, change: 0 },
    projects: { active: 0, change: 0 },
    clients: { total: 0, change: 0 },
    views: { total: 0, change: 0 },
    downloads: { total: 0, change: 0 },
    users: { total: 0 },
  });
});

// Users management routes
router.use('/users', usersRouter);
router.use('/settings', authenticate, settingsRouter);

// New profile system routes (all protected)
router.use('/addresses', authenticate, addressesRouter);
router.use('/wishlist', authenticate, wishlistRouter);
router.use('/sessions', authenticate, sessionsRouter);
router.use('/support', authenticate, supportRouter);

// Protected routes
router.use('/orders', authenticate, ordersRouter);
router.use('/payments', authenticate, paymentsRouter);
router.use('/messages', authenticate, messagesRouter);
router.use('/clients', authenticate, clientsRouter);
// Secure upload route (auth protected)
router.use('/upload', uploadRoutes);

