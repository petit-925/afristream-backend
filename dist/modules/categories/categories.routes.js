"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const auth_1 = require("../../common/middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", categories_controller_1.getCategories);
router.get("/:slug", categories_controller_1.getCategoryBySlug);
// Admin routes
router.post("/", auth_1.authenticateAdmin, categories_controller_1.createCategory);
router.delete("/:id", auth_1.authenticateAdmin, categories_controller_1.deleteCategory);
exports.default = router;
