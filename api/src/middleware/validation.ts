import { z } from "zod";
import { Request, Response, NextFunction } from "express";

// User validation schemas
const userSignInSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(1),
});

const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  level: z.enum(["user", "admin"]),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  level: z.enum(["user", "admin"]).optional(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    )
    .optional(),
});

// Company validation schema
const companySchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(200),
  phone: z.string().regex(/^[0-9+\-\s()]+$/),
  email: z.string().email().optional().or(z.literal("")),
  taxCode: z.string().min(1).max(50),
});

// Product validation schema
const productSchema = z.object({
  serial: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  release: z.string(),
  color: z.string(),
  price: z.number().positive().max(1000000),
  costPrice: z.number().nonnegative().max(1000000).optional(),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().regex(/^[0-9+\-\s()]+$/),
  customerAddress: z.string(),
  remark: z.string().max(500).optional(),
  qty: z.number().int().positive().max(100),
});

// Sell validation schema
const sellSchema = z.object({
  serial: z.string().min(1),
  price: z.number().positive(),
});

// Service validation schema
const serviceSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  remark: z.string().max(500).optional(),
});

// Validation middleware
const validateRequest =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ errors: (error as z.ZodError).issues });
    }
  };

export {
  userSignInSchema,
  userCreateSchema,
  userUpdateSchema,
  companySchema,
  productSchema,
  sellSchema,
  serviceSchema,
  validateRequest,
};
