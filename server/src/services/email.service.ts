import nodemailer from "nodemailer";
import { config } from "../config/env.js";
import { IReservation } from "../models/Reservation.model.js";
import { IRoom } from "../models/Room.model.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.emailUser,
    pass: config.emailAppPassword,
  },
});

const isEmailConfigured = (): boolean => Boolean(config.emailUser && config.emailAppPassword);

const formatDate = (date: Date): string =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const buildReservationEmailHtml = (
  reservation: IReservation,
  headline: string,
  introLine: string
): string => {
  const room = reservation.room as unknown as IRoom;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
      <div style="background: linear-gradient(135deg, #b45309, #f59e0b); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">GrandStay Hotels</h1>
        <p style="color: #fff7ed; margin: 4px 0 0; font-size: 13px;">${headline}</p>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
        <p>Dear ${reservation.guestName},</p>
        <p>${introLine}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #64748b;">Booking ID</td><td style="padding: 6px 0; text-align: right; font-weight: bold;">${reservation.bookingId}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Room</td><td style="padding: 6px 0; text-align: right;">${room?.roomType || ""} (${room?.roomNumber || ""})</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Check-in</td><td style="padding: 6px 0; text-align: right;">${formatDate(reservation.checkInDate)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Check-out</td><td style="padding: 6px 0; text-align: right;">${formatDate(reservation.checkOutDate)}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b;">Guests</td><td style="padding: 6px 0; text-align: right;">${reservation.numberOfGuests}</td></tr>
          <tr><td style="padding: 10px 0 0; color: #64748b; border-top: 1px solid #e2e8f0;">Total Amount</td><td style="padding: 10px 0 0; text-align: right; font-weight: bold; border-top: 1px solid #e2e8f0;">$${reservation.totalAmount}</td></tr>
        </table>
        <p style="font-size: 13px; color: #64748b;">Status: <strong>${reservation.status}</strong>. You can view or manage this booking anytime from your GrandStay account.</p>
        <p style="margin-top: 24px;">We look forward to hosting you.</p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">GrandStay Hotels — This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
};

export const sendBookingConfirmationEmail = async (
  reservation: IReservation
): Promise<void> => {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] EMAIL_USER/EMAIL_APP_PASSWORD not configured — skipped confirmation email for booking ${reservation.bookingId}.`
    );
    return;
  }

  const html = buildReservationEmailHtml(
    reservation,
    "Booking Confirmation",
    "Thank you for choosing GrandStay Hotels. Your reservation has been received with the following details:"
  );

  try {
    await transporter.sendMail({
      from: config.emailFrom,
      to: reservation.email,
      subject: `Booking Received — GrandStay Hotels (#${reservation.bookingId})`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send confirmation email for booking ${reservation.bookingId}:`, error);
  }
};

export const sendReservationConfirmedEmail = async (
  reservation: IReservation
): Promise<void> => {
  if (!isEmailConfigured()) {
    console.warn(
      `[email] EMAIL_USER/EMAIL_APP_PASSWORD not configured — skipped status email for booking ${reservation.bookingId}.`
    );
    return;
  }

  const html = buildReservationEmailHtml(
    reservation,
    "Reservation Confirmed",
    "Great news! Our staff has confirmed your reservation. Here are your finalized booking details:"
  );

  try {
    await transporter.sendMail({
      from: config.emailFrom,
      to: reservation.email,
      subject: `Reservation Confirmed — GrandStay Hotels (#${reservation.bookingId})`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send confirmation status email for booking ${reservation.bookingId}:`, error);
  }
};
