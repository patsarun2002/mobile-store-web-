import { Router } from "express";
import { SellController } from "../../controllers/SellController";
import { authenticateToken } from "../../middleware/auth";

const router = Router();

router.get("/dashboard", authenticateToken, SellController.dashboard);
router.get("/revenue-by-month", authenticateToken, SellController.revenueByMonth);
router.get("/today-sales", authenticateToken, SellController.todaySales);

export default router;
