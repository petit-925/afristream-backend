import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { errorHandler } from './common/errors/errorHandler';
import { notFoundHandler } from './common/errors/notFound';
import { router as apiRouter } from './routes';
import { logger } from './config/logger';
import { applySecurity } from './config/security';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Helmet with relaxed cross-origin policies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

// ✅ Setup CORS once (must be before any rate limiting/security that could block preflight)
const corsOrigins = [env.CLIENT_ORIGIN, env.ADMIN_ORIGIN].filter(Boolean) as string[];
const isDev = env.NODE_ENV === 'development';
const corsOptions = {
  // In development, allow all origins to avoid local CORS friction
  origin: isDev ? true : corsOrigins,
  credentials: true,
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] as string[],
  allowedHeaders: ['Content-Type', 'Authorization'] as string[],
};

app.use(cors({
  origin: [
    'https://yourfrontend.netlify.app',
    'https://yourdashboard.netlify.app'
  ],
  credentials: true
}));
app.options('*', cors(corsOptions));

// ✅ Apply your custom security middleware after CORS so preflight isn't blocked
applySecurity(app);

// 📂 Serve static uploads with logging + CORS
app.use(
  '/uploads',
  (req, _res, next) => {
    console.log(`📂 Uploads request: ${req.method} ${req.originalUrl}`);
    next();
  },
  cors(corsOptions),
  express.static('uploads')
);

// ✅ Logging
app.use(pinoHttp({ logger }));
app.use(morgan('tiny'));

// ✅ Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ✅ API routes
app.use('/api/v1', apiRouter);

// ✅ Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
