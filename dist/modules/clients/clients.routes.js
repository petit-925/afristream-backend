"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const clients_controller_1 = require("./clients.controller");
exports.router = (0, express_1.Router)();
exports.router.get('/', clients_controller_1.listClients);
exports.router.post('/', clients_controller_1.createClient);
