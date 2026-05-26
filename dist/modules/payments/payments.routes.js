"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
exports.router = (0, express_1.Router)();
exports.router.post('/init', payments_controller_1.initPayment);
exports.router.post('/webhook', payments_controller_1.paystackWebhook);
exports.router.get('/verify/:reference', payments_controller_1.verifyPaystack);
// Mobile Money
exports.router.post('/momo/initiate', payments_controller_1.initiateMomo);
exports.router.get('/momo/verify/:reference', payments_controller_1.verifyMomo);
