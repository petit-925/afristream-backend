"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const testimonials_controller_1 = require("./testimonials.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', testimonials_controller_1.listTestimonials);
exports.router.get('/stats', testimonials_controller_1.getTestimonialStats);
