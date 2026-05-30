import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "@prisma/client";

export const UserController = {
  signIn: async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await UserService.signIn(
        req.body.username,
        req.body.password,
      );
      res.json(result);
    } catch (error) {
      res.status(401).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  info: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await UserService.getUserInfo(req.user?.id || "");
      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  update: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await UserService.updateUser(req.user?.id || "", req.body);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await UserService.listUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    try {
      await UserService.createUser(req.body);
      res.json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  updateId: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await UserService.updateUserById(
        id,
        req.user?.id || "",
        (req.user?.level || "user") as UserRole,
        req.body,
      );
      res.json({ message: "User updated successfully" });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "Access denied" ? 403 : 500;
      res.status(statusCode).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  removeId: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await UserService.removeUser(
        id,
        req.user?.id || "",
        (req.user?.level || "user") as UserRole,
      );
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "Access denied" ? 403 : 500;
      res.status(statusCode).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
