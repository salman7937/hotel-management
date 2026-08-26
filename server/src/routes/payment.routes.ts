import { Router } from "express";
import { createSession, getBookingBySession } from "../controllers/payment.controller.js";
import { optionalVerifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public: guest or logged-in customer starts a Stripe checkout for a prospective booking.
// No reservation is created here — only once Stripe confirms payment (webhook).
router.post("/create-checkout-session", optionalVerifyToken, createSession);

// Public: the post-payment success page polls this until the webhook has created the reservation.
router.get("/session/:sessionId", getBookingBySession);

export default router;
