import { Router, Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { env } from '../config/env';
import { authenticate } from '../common/middleware/auth';
import { AppError } from '../common/errors/AppError';

// Ensure uploads directory exists
const uploadsDir = env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed MIME types from env
const allowedMimeTypes = new Set(
  (env.ALLOWED_FILE_TYPES || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    cb(null, `${timestamp}-${random}${ext}`);
  },
});

// Filter and limits
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedMimeTypes.size > 0 && !allowedMimeTypes.has(file.mimetype)) {
    (req as any)._invalidFileType = true;
    return cb(null, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

const router = Router();

// Build absolute URL (remove /api/v1)
const getPublicUrl = (filename: string) => {
  const baseUrl = env.BASE_URL || 'http://localhost:5000'; // define in .env
  return `${baseUrl}/uploads/${filename}`;
};

router.post(
  '/',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const handler = upload.single('file');
    handler(req, res, (err: any) => {
      if (err) return next(err);

      const file = (req as any).file as Express.Multer.File | undefined;
      const invalidType = (req as any)._invalidFileType;

      if (!file) {
        if (invalidType) return next(AppError.badRequest('Invalid file type'));
        return next(AppError.badRequest('No file uploaded'));
      }

      const payload = {
        url: getPublicUrl(file.filename), // ✅ fixed here
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      };

      return res.status(201).json(payload);
    });
  }
);

// Bulk upload
router.post(
  '/multiple',
  authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    const handler = upload.array('files', 20);
    handler(req, res, (err: any) => {
      if (err) return next(err);

      const files = (req as any).files as Express.Multer.File[] | undefined;
      const invalidType = (req as any)._invalidFileType;

      if (!files || files.length === 0) {
        if (invalidType) return next(AppError.badRequest('Invalid file type'));
        return next(AppError.badRequest('No file uploaded'));
      }

      const items = files.map((file) => ({
        url: getPublicUrl(file.filename), // ✅ fixed here
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
      }));

      const urls = items.map((i) => i.url);
      return res.status(201).json({ files: items, urls });
    });
  }
);

export default router;
