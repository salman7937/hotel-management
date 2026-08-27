"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { getReservationByIdApi, cancelMyBookingApi } from "../../api/reservationApi";
import { ReservationData } from "../../store/slices/reservationsSlice";

const row = "flex justify-between gap-4 py-2.5 border-b border-rule";
const key = "font-mono text-2xs uppercase tracking-widest text-muted";
const val = "font-mono text-sm text-ink text-right";

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted">Loading…</p>
        </div>
      }
    >
      <BookingDetailContent />
    </Suspense>
  );
}

function BookingDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.id as string;
  const paymentResult = searchParams?.get("payment");

  const [booking, setBooking] = useState<ReservationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!booking) return;
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const response = await cancelMyBookingApi(booking._id);
      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        setCancelError(response.message || "Failed to cancel booking.");
      }
    } catch (err: any) {
      setCancelError(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      setLoading(true);
      try {
        const response = await getReservationByIdApi(bookingId);
        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          setError(response.message || "Reservation not found.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const roomObj = booking && typeof booking.room === "object" ? booking.room : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/my-bookings"
          className="font-mono text-2xs uppercase tracking-widest text-muted hover:text-pine transition-colors"
        >
          ← My bookings
        </Link>

        {loading ? (
          <p className="mt-16 font-mono text-2xs uppercase tracking-widest text-muted">Loading…</p>
        ) : error || !booking ? (
          <div className="mt-16">
            <h1 className="font-display font-medium text-3xl text-stop">
              {error || "Reservation not found."}
            </h1>
          </div>
        ) : (
          <div className="mt-8 border border-rule bg-paper-2 p-8">
            {paymentResult === "success" && (
              <p className="mb-6 border-l-2 border-pine pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-pine">
                Payment successful — reservation confirmed.
              </p>
            )}
            {paymentResult === "cancelled" && (
              <p className="mb-6 border-l-2 border-brass pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-brass leading-relaxed">
                Payment not completed — reservation still held as unpaid. Try again anytime.
              </p>
            )}

            <div className="flex items-start justify-between gap-4 pb-5 border-b border-rule">
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass">
                  Reservation
                </p>
                <h1 className="mt-1 font-display font-medium text-4xl text-ink tabular">
                  {booking.bookingId}
                </h1>
                <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-muted tabular">
                  Booked {new Date(booking.createdAt).toLocaleDateString("en-GB")}
                </p>
              </div>
              <Badge variant={booking.status} size="md">
                {booking.status}
              </Badge>
            </div>

            <dl className="mt-5 border-t border-rule">
              <div className={row}>
                <dt className={key}>Room</dt>
                <dd className={val}>
                  {roomObj ? `${roomObj.roomType} · № ${roomObj.roomNumber}` : "—"}
                </dd>
              </div>
              <div className={row}>
                <dt className={key}>Guests</dt>
                <dd className={`${val} tabular`}>{booking.numberOfGuests}</dd>
              </div>
              <div className={row}>
                <dt className={key}>Arrival</dt>
                <dd className={`${val} tabular`}>
                  {new Date(booking.checkInDate).toLocaleDateString("en-GB")}
                </dd>
              </div>
              <div className={row}>
                <dt className={key}>Departure</dt>
                <dd className={`${val} tabular`}>
                  {new Date(booking.checkOutDate).toLocaleDateString("en-GB")}
                </dd>
              </div>
              <div className={row}>
                <dt className={key}>Guest name</dt>
                <dd className={val}>{booking.guestName}</dd>
              </div>
              <div className={row}>
                <dt className={key}>Email</dt>
                <dd className={val}>{booking.email}</dd>
              </div>
              <div className={row}>
                <dt className={key}>Phone</dt>
                <dd className={`${val} tabular`}>{booking.phone}</dd>
              </div>
              <div className={row}>
                <dt className={key}>Payment</dt>
                <dd className={val}>
                  {booking.paymentMethod === "online" ? "Online" : "At hotel"}
                  {" · "}
                  <span className={booking.paymentStatus === "paid" ? "text-pine" : "text-brass"}>
                    {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </dd>
              </div>
              {booking.specialRequests && (
                <div className={row}>
                  <dt className={key}>Requests</dt>
                  <dd className={`${val} font-sans max-w-xs`}>{booking.specialRequests}</dd>
                </div>
              )}
              <div className="flex justify-between items-baseline py-4">
                <dt className={key}>Total</dt>
                <dd className="font-display text-3xl text-ink tabular">${booking.totalAmount}</dd>
              </div>
            </dl>

            {(booking.status === "Pending" || booking.status === "Confirmed") && (
              <div className="mt-4 pt-5 border-t border-rule flex flex-col gap-2">
                {cancelError && (
                  <p className="font-mono text-2xs uppercase tracking-widest text-stop">
                    {cancelError}
                  </p>
                )}
                <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
                  {cancelling ? "Cancelling…" : "Cancel this booking"}
                </Button>
                <p className="font-mono text-2xs uppercase tracking-widest text-muted leading-relaxed">
                  Free while pending or confirmed. Contact the front desk for later changes.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
