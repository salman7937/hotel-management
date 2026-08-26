import mongoose from "mongoose";
import { Reservation, IReservation, BookingStatus } from "../models/Reservation.model.js";
import { Room } from "../models/Room.model.js";
import { ApiError } from "../utils/ApiError.js";
import { CreateReservationInput } from "../validators/reservation.validator.js";
import { sendBookingConfirmationEmail, sendReservationConfirmedEmail } from "./email.service.js";

export const findReservationByStripeSessionId = async (
  sessionId: string
): Promise<IReservation | null> => {
  return Reservation.findOne({ stripeSessionId: sessionId }).populate("room");
};

/**
 * DOUBLE BOOKING PREVENTION ENGINE
 * Checks if a room is available for the given date range.
 * Overlap formula: (existingCheckIn < newCheckOut) AND (existingCheckOut > newCheckIn)
 */
export const isRoomAvailable = async (
  roomId: string,
  checkIn: Date,
  checkOut: Date,
  excludeReservationId?: string
): Promise<boolean> => {
  const query: any = {
    room: roomId,
    status: { $ne: "Cancelled" },
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn },
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const conflictingReservation = await Reservation.findOne(query);
  return !conflictingReservation;
};

/**
 * Generate unique GrandStay Booking ID (e.g. GS-849201)
 */
const generateBookingId = async (): Promise<string> => {
  let bookingId = "";
  let isUnique = false;
  while (!isUnique) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    bookingId = `GS-${randomNum}`;
    const existing = await Reservation.findOne({ bookingId });
    if (!existing) isUnique = true;
  }
  return bookingId;
};

interface ValidatedReservationPricing {
  room: InstanceType<typeof Room>;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
}

/**
 * Shared validation used by both the cash-booking flow and the Stripe
 * checkout flow: room existence/availability, guest capacity, date overlap,
 * and pricing. Does NOT write anything to the database.
 */
const validateAndPriceReservation = async (input: {
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}): Promise<ValidatedReservationPricing> => {
  const room = await Room.findById(input.room);
  if (!room) {
    throw new ApiError(404, "Selected room does not exist.");
  }

  if (!room.isAvailable) {
    throw new ApiError(400, `Room '${room.roomNumber}' is currently out of service or unavailable.`);
  }

  if (input.numberOfGuests > room.maxGuests) {
    throw new ApiError(
      400,
      `Number of guests (${input.numberOfGuests}) exceeds room capacity (${room.maxGuests}).`
    );
  }

  const checkIn = new Date(input.checkInDate);
  const checkOut = new Date(input.checkOutDate);

  const available = await isRoomAvailable(input.room, checkIn, checkOut);
  if (!available) {
    throw new ApiError(
      409,
      `Room '${room.roomNumber}' is already reserved for the selected date range (${checkIn.toISOString().split("T")[0]} to ${checkOut.toISOString().split("T")[0]}).`
    );
  }

  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const totalAmount = nights * room.pricePerNight;

  return { room, checkIn, checkOut, totalAmount };
};

export const createReservation = async (
  input: CreateReservationInput,
  userId?: string
): Promise<IReservation> => {
  const { room, checkIn, checkOut, totalAmount } = await validateAndPriceReservation(input);

  const bookingId = await generateBookingId();

  const reservation = await Reservation.create({
    bookingId,
    guest: userId ? new mongoose.Types.ObjectId(userId) : undefined,
    guestName: input.guestName,
    email: input.email.toLowerCase(),
    phone: input.phone,
    room: room._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests: input.numberOfGuests,
    specialRequests: input.specialRequests || "",
    totalAmount,
    status: "Pending",
    paymentMethod: input.paymentMethod,
    paymentStatus: "unpaid",
  });

  const populatedReservation = await (await reservation.populate("room")).populate(
    "guest",
    "-password"
  );

  // Awaited (not fire-and-forget) so serverless platforms don't kill the function
  // before the email finishes sending; email.service already swallows its own errors.
  await sendBookingConfirmationEmail(populatedReservation);

  return populatedReservation;
};

/**
 * Validates an intended online booking WITHOUT writing it to the database.
 * Used before creating a Stripe Checkout session so an abandoned/failed
 * payment never leaves a room blocked or a phantom reservation for staff to see.
 */
export const validateOnlineBookingRequest = async (input: {
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}): Promise<{ totalAmount: number }> => {
  const { totalAmount } = await validateAndPriceReservation(input);
  return { totalAmount };
};

export interface OnlineCheckoutMetadata {
  guestName: string;
  email: string;
  phone: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  userId?: string;
}

/**
 * Called only from the Stripe webhook after payment has actually succeeded.
 * Re-validates availability (another booking may have taken the room while
 * this customer was on the Stripe payment page) — if it's no longer
 * available, no reservation is created and the caller is told to refund.
 */
export const finalizeOnlinePayment = async (
  metadata: OnlineCheckoutMetadata,
  stripeSessionId: string
): Promise<{ reservation: IReservation | null; roomStillAvailable: boolean }> => {
  const existing = await Reservation.findOne({ stripeSessionId });
  if (existing) {
    const populated = await (await existing.populate("room")).populate("guest", "name email role");
    return { reservation: populated, roomStillAvailable: true };
  }

  let pricing: ValidatedReservationPricing;
  try {
    pricing = await validateAndPriceReservation(metadata);
  } catch {
    return { reservation: null, roomStillAvailable: false };
  }

  const { room, checkIn, checkOut, totalAmount } = pricing;
  const bookingId = await generateBookingId();

  const reservation = await Reservation.create({
    bookingId,
    guest: metadata.userId ? new mongoose.Types.ObjectId(metadata.userId) : undefined,
    guestName: metadata.guestName,
    email: metadata.email.toLowerCase(),
    phone: metadata.phone,
    room: room._id,
    checkInDate: checkIn,
    checkOutDate: checkOut,
    numberOfGuests: metadata.numberOfGuests,
    specialRequests: metadata.specialRequests || "",
    totalAmount,
    status: "Confirmed",
    paymentMethod: "online",
    paymentStatus: "paid",
    stripeSessionId,
  });

  const populatedReservation = await (await reservation.populate("room")).populate(
    "guest",
    "-password"
  );

  await sendReservationConfirmedEmail(populatedReservation);

  return { reservation: populatedReservation, roomStillAvailable: true };
};

export interface ReservationQueryFilters {
  status?: string;
  search?: string;
  roomId?: string;
}

export const getAllReservations = async (filters: ReservationQueryFilters = {}) => {
  const query: any = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.roomId) {
    query.room = filters.roomId;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    query.$or = [
      { bookingId: searchRegex },
      { guestName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  return Reservation.find(query)
    .populate("room")
    .populate("guest", "name email role")
    .sort({ createdAt: -1 });
};

export interface GuestQueryFilters {
  search?: string;
}

export const getAllGuests = async (filters: GuestQueryFilters = {}) => {
  const match: any = {};
  if (filters.search) {
    const searchRegex = new RegExp(filters.search, "i");
    match.$or = [
      { guestName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  return Reservation.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $toLower: "$email" },
        guestName: { $last: "$guestName" },
        email: { $last: "$email" },
        phone: { $last: "$phone" },
        guest: { $last: "$guest" },
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        lastBookingDate: { $max: "$createdAt" },
        statuses: { $push: "$status" },
      },
    },
    { $sort: { lastBookingDate: -1 } },
  ]);
};

export const getMyReservations = async (userId: string) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  return Reservation.find({ guest: userObjectId })
    .populate("room")
    .sort({ createdAt: -1 });
};

export const getReservationById = async (reservationId: string): Promise<IReservation> => {
  const reservation = await Reservation.findById(reservationId)
    .populate("room")
    .populate("guest", "name email role");

  if (!reservation) {
    throw new ApiError(404, `Reservation with ID ${reservationId} not found.`);
  }

  return reservation;
};

/**
 * State Machine Transition Rules for Reservation Status:
 * - Pending -> Confirmed, Cancelled
 * - Confirmed -> Checked-in, Cancelled
 * - Checked-in -> Checked-out
 * - Checked-out -> Terminal
 * - Cancelled -> Terminal
 */
export const updateReservationStatus = async (
  reservationId: string,
  newStatus: BookingStatus
): Promise<IReservation> => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new ApiError(404, `Reservation with ID ${reservationId} not found.`);
  }

  const currentStatus = reservation.status;

  if (currentStatus === newStatus) {
    return reservation.populate("room");
  }

  // Validate allowed transitions
  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    Pending: ["Confirmed", "Cancelled"],
    Confirmed: ["Checked-in", "Cancelled"],
    "Checked-in": ["Checked-out"],
    "Checked-out": [],
    Cancelled: [],
  };

  const allowedNextStatuses = validTransitions[currentStatus] || [];
  if (!allowedNextStatuses.includes(newStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed next statuses: ${allowedNextStatuses.join(", ") || "None"}.`
    );
  }

  reservation.status = newStatus;
  await reservation.save();

  const populatedReservation = await (await reservation.populate("room")).populate(
    "guest",
    "name email role"
  );

  if (newStatus === "Confirmed") {
    await sendReservationConfirmedEmail(populatedReservation);
  }

  return populatedReservation;
};
