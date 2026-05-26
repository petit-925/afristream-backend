import { Router } from "express";
import {
  getPortfolio,
  getPortfolioBySlug,
  getPortfolioById,
  createPortfolio,
  deletePortfolio,
  updatePortfolio,
} from "./portfolio.controller";
import { authenticate } from "../../common/middleware/auth";

const router = Router();

// Public routes
router.get("/", getPortfolio);
router.get("/slug/:slug", getPortfolioBySlug);
router.get("/:id", getPortfolioById);

// Protected routes (authenticated users can create; adjust to admin if needed)
router.post("/", authenticate, createPortfolio);
router.put("/:id", authenticate, updatePortfolio);
router.delete("/:id", authenticate, deletePortfolio);

export default router;
