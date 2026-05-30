import { Router } from "express";
import { ServiceController } from "../../controllers/ServiceController";
import { authenticateToken, authorize } from "../../middleware/auth";
import { validateRequest, serviceSchema } from "../../middleware/validation";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  validateRequest(serviceSchema),
  ServiceController.create
);
router.get("/", authenticateToken, ServiceController.list);
router.put(
  "/:id",
  authenticateToken,
  authorize("admin"),
  validateRequest(serviceSchema),
  ServiceController.update
);
router.delete(
  "/:id",
  authenticateToken,
  authorize("admin"),
  ServiceController.remove
);

export default router;
