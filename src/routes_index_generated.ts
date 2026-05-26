import { Express } from "express";
import productRoutes from "./modules/products/product.routes";
import categoryRoutes from "./modules/categories/categories.routes";
import portfolioRoutes from "./modules/portfolio/portfolio.routes";

export const registerRoutes = (app: Express) => {
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/portfolio", portfolioRoutes);
};
