import { Router } from "express";
import rateLimit from "express-rate-limit";
import { UserController } from "../../controllers/UserController";
import { authenticateToken, authorize } from "../../middleware/auth";
import {
  validateRequest,
  userSignInSchema,
  userCreateSchema,
  userUpdateSchema,
} from "../../middleware/validation";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 100,
  message: "Too many attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth routes
router.post(
  "/signin",
  authLimiter,
  validateRequest(userSignInSchema),
  UserController.signIn,
);

// User routes
router.get("/me", authenticateToken, UserController.info);
router.put(
  "/me",
  authenticateToken,
  validateRequest(userUpdateSchema),
  UserController.update,
);
router.get("/", authenticateToken, authorize("admin"), UserController.list);
router.post(
  "/",
  authenticateToken,
  authorize("admin"),
  validateRequest(userCreateSchema),
  UserController.create,
);
router.put(
  "/:id",
  authenticateToken,
  authorize("admin"),
  validateRequest(userUpdateSchema),
  UserController.updateId,
);
router.delete(
  "/:id",
  authenticateToken,
  authorize("admin"),
  UserController.removeId,
);

export default router;
