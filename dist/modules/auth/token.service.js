"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.storeRefreshToken = storeRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
exports.findRefreshToken = findRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../services/db");
const env_1 = require("../../config/env");
function generateTokens(payload) {
    const secret = env_1.env.JWT_SECRET;
    const toExpires = (val, fallback) => {
        if (typeof val === 'number')
            return val;
        if (typeof val === 'string') {
            const n = Number(val);
            return Number.isFinite(n) ? n : val; // allow "7d", or numeric seconds
        }
        return fallback;
    };
    const accessOpts = { expiresIn: toExpires(env_1.env.JWT_EXPIRES_IN, '15m') };
    const refreshOpts = { expiresIn: toExpires(env_1.env.REFRESH_TOKEN_EXPIRES_IN, '7d') };
    const accessToken = jsonwebtoken_1.default.sign(payload, secret, accessOpts);
    const refreshToken = jsonwebtoken_1.default.sign({ sub: payload.id, type: 'refresh' }, secret, refreshOpts);
    return { accessToken, refreshToken };
}
async function storeRefreshToken(userId, refreshToken, isClient) {
    await db_1.pool.query('INSERT INTO refresh_tokens (user_id, is_client, token, created_at) VALUES (?, ?, ?, NOW())', [userId, isClient ? 1 : 0, refreshToken]);
}
async function revokeRefreshToken(token) {
    await db_1.pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}
async function findRefreshToken(token) {
    const [rows] = await db_1.pool.query('SELECT * FROM refresh_tokens WHERE token = ? LIMIT 1', [token]);
    return Array.isArray(rows) ? rows[0] : null;
}
