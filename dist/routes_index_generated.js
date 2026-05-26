"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = void 0;
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const categories_routes_1 = __importDefault(require("./modules/categories/categories.routes"));
const portfolio_routes_1 = __importDefault(require("./modules/portfolio/portfolio.routes"));
const registerRoutes = (app) => {
    app.use("/api/products", product_routes_1.default);
    app.use("/api/categories", categories_routes_1.default);
    app.use("/api/portfolio", portfolio_routes_1.default);
};
exports.registerRoutes = registerRoutes;
