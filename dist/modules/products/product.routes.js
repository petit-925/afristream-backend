"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../products/product.controller");
const auth_1 = require("../../common/middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get("/", product_controller_1.getProducts);
// Reviews for a product
router.get("/:id/reviews", product_controller_1.listProductReviews);
router.post("/:id/reviews", auth_1.authenticate, product_controller_1.createProductReview);
router.get("/:id", product_controller_1.getProduct); // Get by ID
router.get("/slug/:slug", product_controller_1.getProductBySlug); // Get by slug
// Admin routes
router.post("/", product_controller_1.createProduct); // Removed authenticateAdmin for now
router.put("/:id", auth_1.authenticateAdmin, product_controller_1.updateProduct);
router.delete("/:id", auth_1.authenticateAdmin, product_controller_1.deleteProduct);
exports.default = router;
