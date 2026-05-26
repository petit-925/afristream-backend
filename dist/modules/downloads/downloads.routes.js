"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const downloads_controller_1 = require("./downloads.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', downloads_controller_1.listDownloads);
exports.router.post('/', downloads_controller_1.createDownload);
