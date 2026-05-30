import { Router } from "express";
import userRoutes from "./userRoutes";
import productRoutes from "./productRoutes";
import sellRoutes from "./sellRoutes";
import serviceRoutes from "./serviceRoutes";
import companyRoutes from "./companyRoutes";
import analyticsRoutes from "./analyticsRoutes";

const router = Router();

router.use("/auth", userRoutes);
router.use("/users", userRoutes);
router.use("/company", companyRoutes);
router.use("/products", productRoutes);
router.use("/sells", sellRoutes);
router.use("/services", serviceRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
