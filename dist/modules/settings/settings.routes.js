"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const settings_controller_1 = require("./settings.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', settings_controller_1.getSettings);
exports.router.put('/', settings_controller_1.updateSettings);
