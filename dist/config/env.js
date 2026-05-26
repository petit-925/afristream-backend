"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = require("dotenv");
// Load environment variables from .env file
(0, dotenv_1.config)();
const EnvSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(5000),
    DATABASE_URL: zod_1.z.string().url().optional(),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_PORT: zod_1.z.coerce.number().default(3306),
    DB_USER: zod_1.z.string().default('root'),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_NAME: zod_1.z.string().default('afristream_db'),
    JWT_SECRET: zod_1.z.string().min(16).default('your-super-secret-jwt-key-change-this-in-production'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default('7d'),
    PAYSTACK_SECRET: zod_1.z.string().optional(),
    PAYSTACK_WEBHOOK_SECRET: zod_1.z.string().optional(),
    BASE_URL: zod_1.z.string().default('http://localhost:5000'),
    CLIENT_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    ADMIN_ORIGIN: zod_1.z.string().default('http://localhost:5174'),
    STORAGE_DRIVER: zod_1.z.enum(['local', 's3']).default('local'),
    S3_BUCKET: zod_1.z.string().optional(),
    S3_REGION: zod_1.z.string().optional(),
    S3_ACCESS_KEY_ID: zod_1.z.string().optional(),
    S3_SECRET_ACCESS_KEY: zod_1.z.string().optional(),
    LOG_LEVEL: zod_1.z.string().default('info'),
    UPLOAD_DIR: zod_1.z.string().default('uploads'),
    MAX_FILE_SIZE: zod_1.z.coerce.number().default(10485760),
    ALLOWED_FILE_TYPES: zod_1.z.string().default('image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm'),
});
exports.env = EnvSchema.parse(process.env);
