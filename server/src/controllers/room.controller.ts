import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "../config/cloudinary.js";
import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../services/room.service.js";

export const getRooms = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    roomType: req.query.roomType as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    guests: req.query.guests ? Number(req.query.guests) : undefined,
    isAvailable:
      req.query.isAvailable === "true"
        ? true
        : req.query.isAvailable === "false"
        ? false
        : undefined,
    checkInDate: req.query.checkInDate as string,
    checkOutDate: req.query.checkOutDate as string,
  };

  const rooms = await getAllRooms(filters);
  res.status(200).json(new ApiResponse(200, rooms, "Rooms fetched successfully"));
});

export const getSingleRoom = asyncHandler(async (req: Request, res: Response) => {
  const roomId = req.params.id as string;
  const room = await getRoomById(roomId);
  res.status(200).json(new ApiResponse(200, room, "Room details fetched successfully"));
});

export const createNewRoom = asyncHandler(async (req: Request, res: Response) => {
  const room = await createRoom(req.body);
  res.status(201).json(new ApiResponse(201, room, "Room created successfully"));
});

export const updateExistingRoom = asyncHandler(async (req: Request, res: Response) => {
  const roomId = req.params.id as string;
  const room = await updateRoom(roomId, req.body);
  res.status(200).json(new ApiResponse(200, room, "Room updated successfully"));
});

export const uploadRoomImage = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) {
    throw new ApiError(400, "No image file was provided.");
  }

  const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "grandstay-hotel/rooms", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result as { secure_url: string });
      }
    );
    stream.end(file.buffer);
  });

  res
    .status(200)
    .json(new ApiResponse(200, { url: uploadResult.secure_url }, "Image uploaded successfully"));
});

export const removeRoom = asyncHandler(async (req: Request, res: Response) => {
  const roomId = req.params.id as string;
  const result = await deleteRoom(roomId);
  res.status(200).json(new ApiResponse(200, result, "Room deleted successfully"));
});
