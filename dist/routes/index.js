"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_1 = require("../common/middleware/auth");
const auth_routes_1 = require("../modules/auth/auth.routes");
const client_auth_routes_1 = require("../modules/auth/client.auth.routes");
const product_routes_1 = __importDefault(require("../modules/products/product.routes"));
const orders_routes_1 = require("../modules/orders/orders.routes");
const payments_routes_1 = require("../modules/payments/payments.routes");
const categories_routes_1 = __importDefault(require("../modules/categories/categories.routes"));
const portfolio_routes_1 = __importDefault(require("../modules/portfolio/portfolio.routes"));
const testimonials_routes_1 = require("../modules/testimonials/testimonials.routes");
const blog_routes_1 = require("../modules/blog/blog.routes");
const help_routes_1 = require("../modules/help/help.routes");
const downloads_routes_1 = require("../modules/downloads/downloads.routes");
const messages_routes_1 = require("../modules/messages/messages.routes");
const clients_routes_1 = require("../modules/clients/clients.routes");
const upload_routes_1 = __importDefault(require("./upload.routes"));
const users_routes_1 = require("../modules/users/users.routes");
const settings_routes_1 = require("../modules/settings/settings.routes");
const addresses_routes_1 = __importDefault(require("../modules/addresses/addresses.routes"));
const wishlist_routes_1 = __importDefault(require("../modules/wishlist/wishlist.routes"));
const sessions_routes_1 = __importDefault(require("../modules/sessions/sessions.routes"));
const support_routes_1 = __importDefault(require("../modules/support/support.routes"));
exports.router = (0, express_1.Router)();
// Public routes
exports.router.use('/auth', auth_routes_1.router);
exports.router.use('/client/auth', client_auth_routes_1.router);
exports.router.use('/products', product_routes_1.default);
exports.router.use('/categories', categories_routes_1.default);
exports.router.use('/portfolio', portfolio_routes_1.default);
exports.router.use('/testimonials', testimonials_routes_1.router);
exports.router.use('/blog', blog_routes_1.router);
exports.router.use('/downloads', downloads_routes_1.router);
exports.router.use('/help', help_routes_1.router);
// Lightweight public analytics endpoint (placeholder)
exports.router.get('/analytics', (_req, res) => {
    return res.json({
        revenue: { total: 0, change: 0 },
        projects: { active: 0, change: 0 },
        clients: { total: 0, change: 0 },
        views: { total: 0, change: 0 },
        downloads: { total: 0, change: 0 },
        users: { total: 0 },
    });
});
// Users management routes
exports.router.use('/users', users_routes_1.router);
exports.router.use('/settings', auth_1.authenticate, settings_routes_1.router);
// New profile system routes (all protected)
exports.router.use('/addresses', auth_1.authenticate, addresses_routes_1.default);
exports.router.use('/wishlist', auth_1.authenticate, wishlist_routes_1.default);
exports.router.use('/sessions', auth_1.authenticate, sessions_routes_1.default);
exports.router.use('/support', auth_1.authenticate, support_routes_1.default);
// Protected routes
exports.router.use('/orders', auth_1.authenticate, orders_routes_1.router);
exports.router.use('/payments', auth_1.authenticate, payments_routes_1.router);
exports.router.use('/messages', auth_1.authenticate, messages_routes_1.router);
exports.router.use('/clients', auth_1.authenticate, clients_routes_1.router);
// Secure upload route (auth protected)
exports.router.use('/upload', upload_routes_1.default);
