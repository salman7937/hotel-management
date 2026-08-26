import { Response } from "express";
import Stripe from "stripe";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import {
  createOnlineBookingCheckout,
  verifyWebhookSignature,
  finalizeCheckoutSession,
} from "../services/payment.service.js";
import { findReservationByStripeSessionId } from "../services/reservation.service.js";

export const createSession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { guestName, email, phone, room, checkInDate, checkOutDate, numberOfGuests, specialRequests } =
    req.body;

  if (!guestName || !email || !phone || !room || !checkInDate || !checkOutDate || !numberOfGuests) {
    throw new ApiError(400, "Missing required booking details.");
  }

  const { url } = await createOnlineBookingCheckout({
    guestName,
    email,
    phone,
    room,
    checkInDate,
    checkOutDate,
    numberOfGuests: Number(numberOfGuests),
    specialRequests,
    userId: req.user?._id?.toString(),
  });

  res.status(200).json(new ApiResponse(200, { url }, "Checkout session created successfully"));
});

export const getBookingBySession = asyncHandler(async (req: AuthRequest, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const reservation = await findReservationByStripeSessionId(sessionId);

  if (!reservation) {
    // Webhook may not have processed yet — client polls and retries.
    res.status(202).json(new ApiResponse(202, null, "Payment is still being processed."));
    return;
  }

  res.status(200).json(new ApiResponse(200, reservation, "Reservation found"));
});

export const handleWebhook = asyncHandler(async (req: AuthRequest, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(req.body, signature);
  } catch (error: any) {
    console.error("[stripe webhook] Signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await finalizeCheckoutSession(session);
    } catch (error) {
      console.error(`[stripe webhook] Failed to finalize session ${session.id}:`, error);
    }
  }

  res.status(200).json({ received: true });
});
