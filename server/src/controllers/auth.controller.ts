import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  refreshUserToken,
  getUserProfile,
} from "../services/auth.service.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/generateToken.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await registerUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res
    .status(201)
    .json(new ApiResponse(201, { user, accessToken }, "User registered successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await loginUser(req.body);
  setRefreshTokenCookie(res, refreshToken);
  res
    .status(200)
    .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies?.refreshToken;
  const tokenFromHeader = req.headers["x-refresh-token"] as string;
  const token = tokenFromCookie || tokenFromHeader;

  const { accessToken } = await refreshUserToken(token);
  res
    .status(200)
    .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const user = await getUserProfile(userId);
  res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});
