"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const portfolio_controller_1 = require("./portfolio.controller");
const auth_1 = require("../../common/middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", portfolio_controller_1.getPortfolio);
router.get("/slug/:slug", portfolio_controller_1.getPortfolioBySlug);
router.get("/:id", portfolio_controller_1.getPortfolioById);
// Protected routes (authenticated users can create; adjust to admin if needed)
router.post("/", auth_1.authenticate, portfolio_controller_1.createPortfolio);
router.put("/:id", auth_1.authenticate, portfolio_controller_1.updatePortfolio);
router.delete("/:id", auth_1.authenticate, portfolio_controller_1.deletePortfolio);
exports.default = router;
