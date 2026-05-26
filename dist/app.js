"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./common/errors/errorHandler");
const notFound_1 = require("./common/errors/notFound");
const routes_1 = require("./routes");
const logger_1 = require("./config/logger");
const security_1 = require("./config/security");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// ✅ Helmet with relaxed cross-origin policies
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
}));
// ✅ Setup CORS once (must be before any rate limiting/security that could block preflight)
const corsOrigins = [env_1.env.CLIENT_ORIGIN, env_1.env.ADMIN_ORIGIN].filter(Boolean);
const isDev = env_1.env.NODE_ENV === 'development';
const corsOptions = {
    // In development, allow all origins to avoid local CORS friction
    origin: isDev ? true : corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use((0, cors_1.default)({
    origin: [
        'https://yourfrontend.netlify.app',
        'https://yourdashboard.netlify.app'
    ],
    credentials: true
}));
app.options('*', (0, cors_1.default)(corsOptions));
// ✅ Apply your custom security middleware after CORS so preflight isn't blocked
(0, security_1.applySecurity)(app);
// 📂 Serve static uploads with logging + CORS
app.use('/uploads', (req, _res, next) => {
    console.log(`📂 Uploads request: ${req.method} ${req.originalUrl}`);
    next();
}, (0, cors_1.default)(corsOptions), express_1.default.static('uploads'));
// ✅ Logging
app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
app.use((0, morgan_1.default)('tiny'));
// ✅ Health check
app.get('/health', (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
});
// ✅ API routes
app.use('/api/v1', routes_1.router);
// ✅ Error handling
app.use(notFound_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
