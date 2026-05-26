"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientRegister = clientRegister;
exports.clientLogin = clientLogin;
exports.clientMe = clientMe;
exports.clientChangePassword = clientChangePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../services/db");
const AppError_1 = require("../../common/errors/AppError");
const authSchemas_1 = require("../../common/validation/authSchemas");
const token_service_1 = require("./token.service");
async function clientRegister(req, res) {
    try {
        const { name, email, password, phone, address } = authSchemas_1.clientRegisterSchema.parse(req.body);
        const [existsRows] = await db_1.pool.query('SELECT id FROM client_users WHERE email = ? LIMIT 1', [email]);
        if (Array.isArray(existsRows) && existsRows.length) {
            throw AppError_1.AppError.conflict('Email already in use');
        }
        const hash = await bcryptjs_1.default.hash(password, 12);
        const now = new Date();
        const [result] = await db_1.pool.query('INSERT INTO client_users (name, email, password, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, email, hash, phone || null, address || null, now, now]);
        const id = result.insertId;
        const tokens = (0, token_service_1.generateTokens)({ id, role: 'client', email });
        await (0, token_service_1.storeRefreshToken)(id, tokens.refreshToken, true);
        res.status(201).json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id, name, email, phone: phone || null, address: address || null } });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Client registration failed', error);
    }
}
async function clientLogin(req, res) {
    try {
        const { email, password } = authSchemas_1.clientLoginSchema.parse(req.body);
        const [rows] = await db_1.pool.query('SELECT * FROM client_users WHERE email = ? LIMIT 1', [email]);
        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !user.password)
            throw AppError_1.AppError.unauthorized('Invalid credentials');
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            throw AppError_1.AppError.unauthorized('Invalid credentials');
        const tokens = (0, token_service_1.generateTokens)({ id: user.id, role: 'client', email: user.email });
        await (0, token_service_1.storeRefreshToken)(user.id, tokens.refreshToken, true);
        res.json({ success: true, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, avatar_url: user.avatar_url } });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Client login failed', error);
    }
}
async function clientMe(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            throw AppError_1.AppError.unauthorized('Not authenticated');
        const [rows] = await db_1.pool.query('SELECT id, name, email, phone, address, avatar_url FROM client_users WHERE id = ? LIMIT 1', [userId]);
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
async function clientChangePassword(req, res) {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword, confirmPassword } = authSchemas_1.changePasswordSchema.parse(req.body);
        if (!userId)
            throw AppError_1.AppError.unauthorized('Not authenticated');
        const [rows] = await db_1.pool.query('SELECT id, password FROM client_users WHERE id = ? LIMIT 1', [userId]);
        const user = Array.isArray(rows) ? rows[0] : null;
        if (!user || !user.password)
            throw AppError_1.AppError.notFound('User not found');
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!valid)
            throw AppError_1.AppError.unauthorized('Current password is incorrect');
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await db_1.pool.query('UPDATE client_users SET password = ?, updated_at = NOW() WHERE id = ?', [hash, userId]);
        res.json({ success: true });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to change password', error);
    }
}
