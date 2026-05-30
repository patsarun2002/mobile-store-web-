import { Request, Response } from "express";
import { SellService } from "../services/SellService";

export const SellController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const customerInfo = {
        name: req.body.customerName,
        phone: req.body.customerPhone,
        address: req.body.customerAddress,
      };
      await SellService.createSell(
        req.body.serial,
        req.body.price,
        req.body.paymentMethod || "cash",
        customerInfo,
      );
      res.json({ message: "Sell created Successfully" });
    } catch (error) {
      const statusCode =
        error instanceof Error && error.message === "Product not found"
          ? 400
          : 500;
      res.status(statusCode).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const sells = await SellService.listSells();
      res.json(sells);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await SellService.removeSell(id);
      res.json({ message: "Sell deleted Successfully" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  confirm: async (req: Request, res: Response): Promise<void> => {
    try {
      await SellService.confirmSells();
      res.json({ message: "Sell confirmed Successfully" });
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  dashboard: async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await SellService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  revenueByMonth: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await SellService.getRevenueByMonth();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  todaySales: async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await SellService.getTodaySales();
      res.json(data);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
