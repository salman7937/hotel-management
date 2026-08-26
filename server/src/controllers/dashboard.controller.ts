import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getDashboardStats } from "../services/dashboard.service.js";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await getDashboardStats();
  res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard statistics fetched successfully"));
});
