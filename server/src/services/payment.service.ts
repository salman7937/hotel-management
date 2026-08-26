import Stripe from "stripe";
import { config } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { Room } from "../models/Room.model.js";
import {
  validateOnlineBookingRequest,
  finalizeOnlinePayment,
  OnlineCheckoutMetadata,
} from "./reservation.service.js";

const stripe = new Stripe(config.stripeSecretKey);

export interface OnlineBookingRequest {
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
 * Validates the booking (room exists, available, capacity, no date overlap)
 * and creates a Stripe Checkout session carrying the booking details in
 * metadata. No Reservation is written to the database at this point — that
 * only happens once Stripe confirms payment via webhook, so an abandoned or
 * cancelled checkout never blocks the room or leaves a phantom booking.
 */
export const createOnlineBookingCheckout = async (
  request: OnlineBookingRequest
): Promise<{ url: string }> => {
  if (!config.stripeSecretKey) {
    throw new ApiError(500, "Online payments are not configured on this server.");
  }

  const { totalAmount } = await validateOnlineBookingRequest(request);
  const room = await Room.findById(request.room);
  if (!room) {
    throw new ApiError(404, "Selected room does not exist.");
  }

  const metadata: Record<string, string> = {
    guestName: request.guestName,
    email: request.email,
    phone: request.phone,
    room: request.room,
    checkInDate: request.checkInDate,
    checkOutDate: request.checkOutDate,
    numberOfGuests: String(request.numberOfGuests),
    specialRequests: request.specialRequests || "",
    userId: request.userId || "",
  };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: request.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(totalAmount * 100),
          product_data: {
            name: `GrandStay Hotels — ${room.roomType} (${room.roomNumber})`,
            description: `${new Date(request.checkInDate).toLocaleDateString()} to ${new Date(
              request.checkOutDate
            ).toLocaleDateString()}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata,
    success_url: `${config.clientUrl}/booking-confirmed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.clientUrl}/book/${request.room}?payment=cancelled`,
  });

  if (!session.url) {
    throw new ApiError(500, "Failed to create Stripe checkout session.");
  }

  return { url: session.url };
};

export const verifyWebhookSignature = (payload: Buffer, signature: string): Stripe.Event => {
  if (!config.stripeWebhookSecret) {
    throw new ApiError(500, "Stripe webhook secret is not configured.");
  }
  return stripe.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
};

/**
 * Handles a confirmed Stripe checkout: creates the reservation from the
 * session metadata. If the room was taken by someone else in the meantime,
 * the payment is automatically refunded instead of double-booking the room.
 */
export const finalizeCheckoutSession = async (session: Stripe.Checkout.Session): Promise<void> => {
  const metadata = session.metadata as unknown as OnlineCheckoutMetadata & {
    numberOfGuests: string;
  };
  if (!metadata?.room) return;

  const { reservation, roomStillAvailable } = await finalizeOnlinePayment(
    {
      guestName: metadata.guestName,
      email: metadata.email,
      phone: metadata.phone,
      room: metadata.room,
      checkInDate: metadata.checkInDate,
      checkOutDate: metadata.checkOutDate,
      numberOfGuests: Number(metadata.numberOfGuests),
      specialRequests: metadata.specialRequests,
      userId: metadata.userId || undefined,
    },
    session.id
  );

  if (!roomStillAvailable || !reservation) {
    // Room got booked by someone else while this customer was paying — refund them.
    if (typeof session.payment_intent === "string") {
      try {
        await stripe.refunds.create({ payment_intent: session.payment_intent });
      } catch (error) {
        console.error(`[stripe] Failed to auto-refund session ${session.id}:`, error);
      }
    }
  }
};
