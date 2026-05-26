"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const help_controller_1 = require("./help.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', help_controller_1.getHelpArticles);
exports.router.get('/:id', help_controller_1.getHelpArticle);
