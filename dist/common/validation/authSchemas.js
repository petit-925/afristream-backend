"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.refreshTokenSchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.clientLoginSchema = exports.loginSchema = exports.clientRegisterSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// User registration schema
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim(),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    phone: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Invalid phone number format'),
    company: zod_1.z.string()
        .max(255, 'Company name must be less than 255 characters')
        .trim()
        .optional(),
    location: zod_1.z.string()
        .max(255, 'Location must be less than 255 characters')
        .trim()
        .optional()
});
// Client registration schema (front-end app)
exports.clientRegisterSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim(),
    email: zod_1.z.string()
        .email('Invalid email format')
        .max(255, 'Email must be less than 255 characters')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    phone: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Invalid phone number format'),
    address: zod_1.z.string().max(1000).optional()
});
// User login schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim(),
    password: zod_1.z.string()
        .min(1, 'Password is required')
});
exports.clientLoginSchema = exports.loginSchema;
// Password change schema
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string()
        .min(8, 'New password must be at least 8 characters')
        .max(128, 'New password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
// Profile update schema
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .trim()
        .optional(),
    phone: zod_1.z.string()
        .optional()
        .refine((val) => !val || /^\+?[\d\s\-\(\)]+$/.test(val), 'Invalid phone number format'),
    company: zod_1.z.string()
        .max(255, 'Company name must be less than 255 characters')
        .trim()
        .optional(),
    location: zod_1.z.string()
        .max(255, 'Location must be less than 255 characters')
        .trim()
        .optional(),
    bio: zod_1.z.string()
        .max(1000, 'Bio must be less than 1000 characters')
        .trim()
        .optional(),
    website: zod_1.z.string()
        .url('Invalid website URL')
        .max(255, 'Website URL must be less than 255 characters')
        .optional(),
    experience: zod_1.z.string()
        .max(255, 'Experience must be less than 255 characters')
        .trim()
        .optional(),
    specialties: zod_1.z.string()
        .max(255, 'Specialties must be less than 255 characters')
        .trim()
        .optional(),
    skills: zod_1.z.string()
        .max(1000, 'Skills must be less than 1000 characters')
        .trim()
        .optional()
});
// Token refresh schema
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required')
});
// Forgot password schema
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email('Invalid email format')
        .toLowerCase()
        .trim()
});
// Reset password schema
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    password: zod_1.z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password must be less than 128 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
