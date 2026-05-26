import { z } from 'zod';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url().optional(),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().default('afristream_db'),
  JWT_SECRET: z.string().min(16).default('your-super-secret-jwt-key-change-this-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  PAYSTACK_SECRET: z.string().optional(),
  PAYSTACK_WEBHOOK_SECRET: z.string().optional(),
  BASE_URL: z.string().default('http://localhost:5000'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_ORIGIN: z.string().default('http://localhost:5174'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  LOG_LEVEL: z.string().default('info'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(10485760),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm'),
});

export const env = EnvSchema.parse(process.env);

