import jwt from "jsonwebtoken";
import { Response } from "express";
import { config } from "../config/env.js";

export interface TokenPayload {
  id: string;
  email: string;
  role: "staff" | "customer";
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn as any,
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn as any,
  });
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
};
