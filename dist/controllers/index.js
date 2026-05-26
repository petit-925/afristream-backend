"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsController = exports.MessagesController = exports.DownloadsController = exports.BlogController = exports.TestimonialsController = exports.PortfolioController = exports.CategoriesController = exports.PaymentsController = exports.OrdersController = exports.ProductsController = exports.AuthController = void 0;
// Barrel file for controllers; import specific controllers from their modules
exports.AuthController = __importStar(require("../modules/auth/auth.controller"));
exports.ProductsController = __importStar(require("../modules/products/product.controller"));
exports.OrdersController = __importStar(require("../modules/orders/orders.controller"));
exports.PaymentsController = __importStar(require("../modules/payments/payments.controller"));
exports.CategoriesController = __importStar(require("../modules/categories/categories.controller"));
exports.PortfolioController = __importStar(require("../modules/portfolio/portfolio.controller"));
exports.TestimonialsController = __importStar(require("../modules/testimonials/testimonials.controller"));
exports.BlogController = __importStar(require("../modules/blog/blog.controller"));
exports.DownloadsController = __importStar(require("../modules/downloads/downloads.controller"));
exports.MessagesController = __importStar(require("../modules/messages/messages.controller"));
exports.ClientsController = __importStar(require("../modules/clients/clients.controller"));
