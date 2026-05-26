"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const blog_controller_1 = require("./blog.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', blog_controller_1.listPosts);
exports.router.get('/stats', blog_controller_1.getBlogStats);
exports.router.post('/', blog_controller_1.createPost);
