import { Response } from "express";

/**
 * Utility function to extract parameter ID from request params
 * Handles both string and array cases (Express params can be arrays)
 */
export const getParamId = (id: string | string[]): string => {
  return Array.isArray(id) ? id[0] : id;
};

/**
 * Standard success response helper
 */
export const success = (
  res: Response,
  message: string,
  data?: unknown,
): void => {
  if (data !== undefined) {
    res.json({ message, data });
  } else {
    res.json({ message });
  }
};
