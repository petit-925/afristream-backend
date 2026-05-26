import { Router } from "express";
import { createCategory, getCategories, getCategoryBySlug, deleteCategory } from "./categories.controller";
import { authenticateAdmin } from "../../common/middleware/auth";

const router = Router();

// Public routes
router.get("/", getCategories);
router.get("/:slug", getCategoryBySlug);

// Admin routes
router.post("/", authenticateAdmin, createCategory);
router.delete("/:id", authenticateAdmin, deleteCategory);

export default router;
