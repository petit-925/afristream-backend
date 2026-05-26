"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.register = register;
exports.changePassword = changePassword;
exports.me = me;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
const authSchemas_1 = require("../../common/validation/authSchemas");
const token_service_1 = require("./token.service");
async function login(req, res) {
    try {
        // Validate input
        const validatedData = authSchemas_1.loginSchema.parse(req.body);
        const { email, password } = validatedData;
        // Find admin user only (dashboard login)
        const [rows] = await db_1.pool.query('SELECT * FROM admin_users WHERE email = ? LIMIT 1', [email]);
        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !user.password) {
            throw AppError_1.AppError.unauthorized('Invalid credentials');
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw AppError_1.AppError.unauthorized('Invalid credentials');
        }
        // Check if user is active
        if (user.status !== 'active') {
            throw AppError_1.AppError.forbidden('Account is not active. Please contact support.');
        }
        // Generate token
        const tokens = (0, token_service_1.generateTokens)({ id: user.id, role: user.role, email: user.email });
        await (0, token_service_1.storeRefreshToken)(user.id, tokens.refreshToken, false);
        // Update last login
        await db_1.pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);
        res.json({
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar_url,
                company: user.company
            }
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw AppError_1.AppError.internal('Login failed', error);
    }
}
async function register(req, res) {
    try {
        // Validate input
        const validatedData = authSchemas_1.registerSchema.parse(req.body);
        const { name, email, password, phone, company, location } = validatedData;
        // Check if email already exists in admin_users
        const [existsRows] = await db_1.pool.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
        if (Array.isArray(existsRows) && existsRows.length) {
            throw AppError_1.AppError.conflict('Email already in use');
        }
        // Hash password
        const hash = await bcryptjs_1.default.hash(password, 12);
        // Create user - auto-activate in development
        const now = new Date();
        const userStatus = process.env.NODE_ENV === 'development' ? 'active' : 'pending';
        const [result] = await db_1.pool.query('INSERT INTO admin_users (name, email, password, phone, company, location, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, email, hash, phone || null, company || null, location || null, 'admin', userStatus, now, now]);
        const insertId = result.insertId;
        const [rows] = await db_1.pool.query('SELECT id, name, email, role, phone, company, location FROM admin_users WHERE id = ?', [insertId]);
        const created = Array.isArray(rows) ? rows[0] : rows;
        // Generate token
        const tokens = (0, token_service_1.generateTokens)({ id: created.id, role: created.role, email: created.email });
        await (0, token_service_1.storeRefreshToken)(created.id, tokens.refreshToken, false);
        res.status(201).json({
            success: true,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: created
        });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError) {
            throw error;
        }
        throw AppError_1.AppError.internal('Registration failed', error);
    }
}
async function changePassword(req, res) {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId)
            throw AppError_1.AppError.unauthorized('Not authenticated');
        if (!currentPassword || !newPassword)
            throw AppError_1.AppError.badRequest('Missing fields');
        const [rows] = await db_1.pool.query('SELECT id, password FROM users WHERE id = ? LIMIT 1', [userId]);
        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !user.password)
            throw AppError_1.AppError.notFound('User not found');
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid)
            throw AppError_1.AppError.unauthorized('Current password is incorrect');
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await db_1.pool.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);
        res.json({ success: true });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to change password', error);
    }
}
async function me(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw AppError_1.AppError.unauthorized('Not authenticated');
        const [rows] = await db_1.pool.query('SELECT id, name, email, role, avatar, company, phone, location FROM users WHERE id = ? LIMIT 1', [userId]);
        const user = Array.isArray(rows) ? rows[0] : rows;
        if (!user)
            throw AppError_1.AppError.notFound('User not found');
        res.json({ user });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to fetch current user', error);
    }
}
