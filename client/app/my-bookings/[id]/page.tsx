"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { getReservationByIdApi } from "../../api/reservationApi";
import { ReservationData } from "../../store/slices/reservationsSlice";
import {
  ArrowLeft,
  BedDouble,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
  Info,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function BookingDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Bookings
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading booking details...</p>
          </div>
        ) : error || !booking ? (
          <div className="glass-panel p-10 rounded-3xl border border-rose-900/50 text-center space-y-3">
            <Info className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-rose-400 font-semibold">{error || "Reservation not found."}</p>
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
            {paymentResult === "success" && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Payment successful! Your reservation is now confirmed.
              </div>
            )}
            {paymentResult === "cancelled" && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                Payment was not completed. Your reservation is still held as unpaid — you can try again anytime.
              </div>
            )}

            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-extrabold text-white font-outfit">
                  Reservation #{booking.bookingId}
                </h1>
                <p className="text-slate-400 text-sm">
                  Created on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={booking.status} size="md">
                {booking.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <BedDouble className="w-3.5 h-3.5" /> Room
                </p>
                <p className="text-sm font-semibold text-white">
                  {roomObj ? `${roomObj.roomType} Room (${roomObj.roomNumber})` : "N/A"}
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Number of Guests
                </p>
                <p className="text-sm font-semibold text-white">{booking.numberOfGuests}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Check-in
                </p>
                <p className="text-sm font-semibold text-white">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Check-out
                </p>
                <p className="text-sm font-semibold text-white">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Guest Name
                </p>
                <p className="text-sm font-semibold text-white">{booking.guestName}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Total Amount
                </p>
                <p className="text-sm font-extrabold text-amber-400">${booking.totalAmount}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </p>
                <p className="text-sm font-semibold text-white">{booking.email}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </p>
                <p className="text-sm font-semibold text-white">{booking.phone}</p>
              </div>

              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  {booking.paymentMethod === "online" ? (
                    <CreditCard className="w-3.5 h-3.5" />
                  ) : (
                    <Banknote className="w-3.5 h-3.5" />
                  )}
                  Payment
                </p>
                <p className="text-sm font-semibold text-white">
                  {booking.paymentMethod === "online" ? "Paid Online" : "Pay at Hotel"}
                  {" · "}
                  <span className={booking.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}>
                    {booking.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                  </span>
                </p>
              </div>
            </div>

            {booking.specialRequests && (
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Special Requests
                </p>
                <p className="text-sm text-slate-300">{booking.specialRequests}</p>
              </div>
            )}

            <Link href="/my-bookings">
              <Button variant="outline" className="w-full">
                Back to My Bookings
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
