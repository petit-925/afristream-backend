"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../common/middleware/auth");
const authSchemas_1 = require("../../common/validation/authSchemas");
const token_service_1 = require("./token.service");
const AppError_1 = require("../../common/errors/AppError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
exports.router = (0, express_1.Router)();
exports.router.post('/login', auth_controller_1.login);
exports.router.post('/register', auth_controller_1.register);
// Protected ping for dashboards
exports.router.get('/protected', (_req, res) => res.json({ ok: true }));
// Change password
exports.router.post('/password', auth_1.authenticate, auth_controller_1.changePassword);
// Get current authenticated user
exports.router.get('/me', auth_1.authenticate, auth_controller_1.me);
// Refresh access token
exports.router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = authSchemas_1.refreshTokenSchema.parse(req.body);
        const stored = await (0, token_service_1.findRefreshToken)(refreshToken);
        if (!stored)
            throw AppError_1.AppError.unauthorized('Invalid refresh token');
        const payload = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
        const isClient = !!stored.is_client;
        const tokens = (0, token_service_1.generateTokens)({ id: payload.sub, role: isClient ? 'client' : 'admin' });
        await (0, token_service_1.revokeRefreshToken)(refreshToken);
        await (0, token_service_1.storeRefreshToken)(payload.sub, tokens.refreshToken, isClient);
        res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    }
    catch (error) {
        if (error instanceof AppError_1.AppError)
            throw error;
        throw AppError_1.AppError.internal('Failed to refresh token', error);
    }
});
