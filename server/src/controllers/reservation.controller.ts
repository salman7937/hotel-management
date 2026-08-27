import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import {
  createReservation,
  getAllReservations,
  getAllGuests,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  cancelOwnReservation,
} from "../services/reservation.service.js";

export const newReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  const reservation = await createReservation(req.body, userId);
  res
    .status(201)
    .json(new ApiResponse(201, reservation, "Reservation created successfully"));
});

export const getReservations = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string,
    search: req.query.search as string,
    roomId: req.query.roomId as string,
  };
  const reservations = await getAllReservations(filters);
  res
    .status(200)
    .json(new ApiResponse(200, reservations, "Reservations fetched successfully"));
});

export const getGuests = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
  };
  const guests = await getAllGuests(filters);
  res.status(200).json(new ApiResponse(200, guests, "Guests fetched successfully"));
});

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const reservations = await getMyReservations(userId, req.user!.email);
  res
    .status(200)
    .json(new ApiResponse(200, reservations, "Your reservations fetched successfully"));
});

export const cancelMyBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reservationId = req.params.id as string;
  const reservation = await cancelOwnReservation(
    reservationId,
    req.user!._id.toString(),
    req.user!.email
  );
  res
    .status(200)
    .json(new ApiResponse(200, reservation, "Booking cancelled successfully"));
});

export const getSingleReservation = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const reservationId = req.params.id as string;
    const reservation = await getReservationById(reservationId);

    // If customer, verify ownership (reservation.guest may be populated or a raw ObjectId)
    if (req.user && req.user.role === "customer") {
      const guestId = reservation.guest
        ? ((reservation.guest as any)._id || reservation.guest).toString()
        : null;
      const ownsById = guestId === req.user._id.toString();
      const ownsByEmail = reservation.email.toLowerCase() === req.user.email.toLowerCase();

      if (!ownsById && !ownsByEmail) {
        throw new ApiError(403, "Access denied. You can only view your own bookings.");
      }
    }

    res
      .status(200)
      .json(new ApiResponse(200, reservation, "Reservation details fetched successfully"));
  }
);

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const reservationId = req.params.id as string;
  const reservation = await updateReservationStatus(reservationId, status);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        reservation,
        `Reservation status updated to '${status}' successfully`
      )
    );
});
