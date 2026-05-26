"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySecurity = applySecurity;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./env");
function applySecurity(app) {
    // Allow preflight requests to pass through without rate limiting
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }
        next();
    });
    // Use very relaxed limits in development to avoid interfering with local testing/React StrictMode
    const isDev = env_1.env.NODE_ENV === 'development';
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
        max: isDev ? 10000 : 100, // Increased from 1000 to 10000 for development
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for health checks and OPTIONS requests
            return req.path === '/health' || req.method === 'OPTIONS';
        },
    });
    app.use(limiter);
}
