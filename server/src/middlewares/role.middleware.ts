import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { UserRole } from "../models/User.model.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Role '${req.user.role}' is not authorized to perform this action.`)
      );
    }

    next();
  };
};
