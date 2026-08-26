import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User, IUser, UserRole } from "../models/User.model.js";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const verifyToken = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    throw new ApiError(401, "Access token missing. Please log in.");
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || "grandstay_access_secret_super_secure_key_2026";
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (!user.isActive) {
      throw new ApiError(403, "User account has been deactivated");
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Access token expired. Please refresh token.");
    }
    throw new ApiError(401, "Invalid access token");
  }
});

export const optionalVerifyToken = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next();
    }

    try {
      const secret = process.env.JWT_ACCESS_SECRET || "grandstay_access_secret_super_secure_key_2026";
      const decoded = jwt.verify(token, secret) as { id: string; email: string; role: UserRole };
      const user = await User.findById(decoded.id).select("-password");
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignore token errors for optional auth
    }
    next();
  }
);

