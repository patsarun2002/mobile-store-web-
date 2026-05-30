import { Request, Response } from "express";
import { ServiceService } from "../services/ServiceService";

export const ServiceController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      await ServiceService.createService(req.body);
      res.json({ message: "Service created successfully" });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const services = await ServiceService.listServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await ServiceService.updateService(id, req.body);
      res.json({ message: "Service updated successfully" });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  remove: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      await ServiceService.removeService(id);
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};
