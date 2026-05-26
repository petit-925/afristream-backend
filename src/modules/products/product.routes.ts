import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProduct,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  listProductReviews,
  createProductReview,
} from "../products/product.controller";
import { authenticate, authenticateAdmin } from "../../common/middleware/auth";

const router = Router();

// Public routes
router.get("/", getProducts);
// Reviews for a product
router.get("/:id/reviews", listProductReviews);
router.post("/:id/reviews", authenticate, createProductReview);
router.get("/:id", getProduct); // Get by ID
router.get("/slug/:slug", getProductBySlug); // Get by slug

// Admin routes
router.post("/", createProduct); // Removed authenticateAdmin for now
router.put("/:id", authenticateAdmin, updateProduct);
router.delete("/:id", authenticateAdmin, deleteProduct);

export default router;
