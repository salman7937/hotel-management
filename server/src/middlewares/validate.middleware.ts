import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return next(new ApiError(422, "Validation failed", errors));
    }
    req.body = result.data;
    next();
  };
};
