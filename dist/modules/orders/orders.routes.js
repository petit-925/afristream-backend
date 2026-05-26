"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_1 = require("../../common/middleware/auth");
const orders_controller_1 = require("./orders.controller");
exports.router = (0, express_1.Router)();
// Admin routes (existing)
exports.router.get('/', orders_controller_1.getOrders);
exports.router.post('/', orders_controller_1.createOrder);
// User-specific routes (new)
exports.router.get('/my-orders', auth_1.authenticate, orders_controller_1.getUserOrders);
exports.router.get('/my-orders/:id', auth_1.authenticate, orders_controller_1.getOrderById);
exports.router.get('/invoice/:id', auth_1.authenticate, orders_controller_1.generateInvoice);
