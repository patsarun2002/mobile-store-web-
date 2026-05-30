import { Router } from "express";
import { CompanyController } from "../../controllers/CompanyController";
import { authenticateToken, authorize } from "../../middleware/auth";
import { validateRequest, companySchema } from "../../middleware/validation";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  validateRequest(companySchema),
  CompanyController.create
);
router.get("/", authenticateToken, CompanyController.list);

export default router;
