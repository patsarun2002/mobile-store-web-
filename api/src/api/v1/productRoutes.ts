import { Router } from "express";
import { ProductController } from "../../controllers/ProductController";
import { authenticateToken, authorize } from "../../middleware/auth";
import { validateRequest, productSchema } from "../../middleware/validation";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  validateRequest(productSchema),
  ProductController.create,
);
router.get("/", authenticateToken, ProductController.list);
router.put(
  "/:id",
  authenticateToken,
  authorize("admin"),
  validateRequest(productSchema),
  ProductController.update,
);
router.delete(
  "/:id",
  authenticateToken,
  authorize("admin"),
  ProductController.remove,
);
router.get(
  "/low-stock-count",
  authenticateToken,
  ProductController.lowStockCount,
);

export default router;
