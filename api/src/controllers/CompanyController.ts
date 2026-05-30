import { Request, Response } from "express";
import { CompanyService } from "../services/CompanyService";

export const CompanyController = {
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      await CompanyService.createOrUpdateCompany(req.body);
      res.json({ message: "Company created successfully" });
    } catch (error) {
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
  },

  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const company = await CompanyService.getCompany();
      res.json(company);
    } catch (error) {
      res
        .status(500)
        .json({
          error: error instanceof Error ? error.message : "Unknown error",
        });
    }
  },
};
