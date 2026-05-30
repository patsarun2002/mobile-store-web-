import { Request, Response } from "express";
import { ProductService } from "../services/ProductService";
import { AppError, asyncHandler } from "../utils/errorHandler";
import { getParamId, success } from "../utils/controllerHelpers";

export const ProductController = {
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      await ProductService.createProduct(req.body);
      success(res, "Product created successfully");
    } catch (err) {
      const errorObj = err as Error;
      if (errorObj.message === "Quantity exceeds limit") {
        throw new AppError(errorObj.message, 400);
      }
      if (errorObj.message.startsWith("Serial ซ้ำในระบบ")) {
        throw new AppError(errorObj.message, 409);
      }
      throw err;
    }
  }),

  list: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as string,
      color: req.query.color as string,
      release: req.query.release as string,
      serial: req.query.serial as string,
    };
    const products = await ProductService.listProducts(filters);
    res.json(products);
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = getParamId(req.params.id);
    await ProductService.updateProduct(id, req.body);
    success(res, "Product updated successfully");
  }),

  remove: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = getParamId(req.params.id);
    await ProductService.removeProduct(id);
    success(res, "Product deleted successfully");
  }),

  lowStockCount: asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const threshold = req.query.threshold
        ? parseInt(req.query.threshold as string)
        : 5;
      const result = await ProductService.getLowStockCount(threshold);
      res.json(result);
    },
  ),
};
