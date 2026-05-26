"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
const buildAuthError = (message) => ({ error: message });
const getBearerToken = (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
        res.status(401).json(buildAuthError('Access denied. No token provided.'));
        return null;
    }
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match || !match[1]) {
        res.status(401).json(buildAuthError('Access denied. Invalid authorization header format.'));
        return null;
    }
    return match[1];
};
const verifyToken = (token, res) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                res.status(401).json(buildAuthError('Token expired. Please log in again.'));
                return null;
            }
            if (error.name === 'NotBeforeError') {
                res.status(401).json(buildAuthError('Token not active yet.'));
                return null;
            }
            if (error.name === 'JsonWebTokenError') {
                res.status(401).json(buildAuthError('Invalid token.'));
                return null;
            }
            res.status(500).json(buildAuthError('Failed to authenticate token.'));
            return null;
        }
        res.status(500).json(buildAuthError('Failed to authenticate token.'));
        return null;
    }
};
const authenticateAdmin = (req, res, next) => {
    const token = getBearerToken(req, res);
    if (!token)
        return;
    const decoded = verifyToken(token, res);
    if (!decoded)
        return;
    req.user = decoded;
    const userPayload = decoded;
    if (!userPayload || (userPayload.role !== 'admin' && userPayload.isAdmin !== true)) {
        return res.status(403).json(buildAuthError('Forbidden: Admins only.'));
    }
    next();
};
exports.authenticateAdmin = authenticateAdmin;
const authenticate = (req, res, next) => {
    const token = getBearerToken(req, res);
    if (!token)
        return;
    const decoded = verifyToken(token, res);
    if (!decoded)
        return;
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        const token = getBearerToken(req, res);
        if (!token)
            return;
        const decoded = verifyToken(token, res);
        if (!decoded)
            return;
        req.user = decoded;
        if (!roles.includes(decoded.role)) {
            return res.status(403).json(buildAuthError('Forbidden: Insufficient permissions.'));
        }
        next();
    };
};
exports.requireRole = requireRole;
