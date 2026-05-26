"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
var database_1 = require("../config/database");
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return __importDefault(database_1).default; } });
