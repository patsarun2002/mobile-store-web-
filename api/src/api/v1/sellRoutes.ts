import { Router } from "express";
import { SellController } from "../../controllers/SellController";
import { authenticateToken, authorize } from "../../middleware/auth";
import { validateRequest, sellSchema } from "../../middleware/validation";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  validateRequest(sellSchema),
  SellController.create,
);
router.get("/", authenticateToken, authorize("admin"), SellController.list);
router.delete(
  "/:id",
  authenticateToken,
  authorize("admin"),
  SellController.remove,
);
router.put(
  "/confirm",
  authenticateToken,
  authorize("admin"),
  SellController.confirm,
);

export default router;
