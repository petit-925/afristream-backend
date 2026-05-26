"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../config/env");
const auth_1 = require("../common/middleware/auth");
const AppError_1 = require("../common/errors/AppError");
// Ensure uploads directory exists
const uploadsDir = env_1.env.UPLOAD_DIR || 'uploads';
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Allowed MIME types from env
const allowedMimeTypes = new Set((env_1.env.ALLOWED_FILE_TYPES || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean));
// Multer storage configuration
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const timestamp = Date.now();
        const random = crypto_1.default.randomBytes(4).toString('hex');
        cb(null, `${timestamp}-${random}${ext}`);
    },
});
// Filter and limits
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.size > 0 && !allowedMimeTypes.has(file.mimetype)) {
        req._invalidFileType = true;
        return cb(null, false);
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: env_1.env.MAX_FILE_SIZE },
});
const router = (0, express_1.Router)();
// Build absolute URL (remove /api/v1)
const getPublicUrl = (filename) => {
    const baseUrl = env_1.env.BASE_URL || 'http://localhost:5000'; // define in .env
    return `${baseUrl}/uploads/${filename}`;
};
router.post('/', auth_1.authenticate, (req, res, next) => {
    const handler = upload.single('file');
    handler(req, res, (err) => {
        if (err)
            return next(err);
        const file = req.file;
        const invalidType = req._invalidFileType;
        if (!file) {
            if (invalidType)
                return next(AppError_1.AppError.badRequest('Invalid file type'));
            return next(AppError_1.AppError.badRequest('No file uploaded'));
        }
        const payload = {
            url: getPublicUrl(file.filename), // ✅ fixed here
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
        };
        return res.status(201).json(payload);
    });
});
// Bulk upload
router.post('/multiple', auth_1.authenticate, (req, res, next) => {
    const handler = upload.array('files', 20);
    handler(req, res, (err) => {
        if (err)
            return next(err);
        const files = req.files;
        const invalidType = req._invalidFileType;
        if (!files || files.length === 0) {
            if (invalidType)
                return next(AppError_1.AppError.badRequest('Invalid file type'));
            return next(AppError_1.AppError.badRequest('No file uploaded'));
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
});
exports.default = router;
