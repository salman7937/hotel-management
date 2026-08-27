"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useAppSelector } from "../../store/hooks";
import { getRoomByIdApi } from "../../api/roomApi";
import { createReservationApi } from "../../api/reservationApi";
import { createOnlineBookingCheckoutApi } from "../../api/paymentApi";
import { RoomData } from "../../store/slices/roomsSlice";
import {
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Banknote,
} from "lucide-react";

export default function BookingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      }
    >
      <BookingCheckoutContent />
    </Suspense>
  );
}

function BookingCheckoutContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const { user } = useAppSelector((state) => state.auth);

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loadingRoom, setLoadingRoom] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<any>(null);

  // Form Fields
  const [guestName, setGuestName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>(searchParams?.get("checkIn") || "");
  const [checkOutDate, setCheckOutDate] = useState<string>(searchParams?.get("checkOut") || "");
  const [numberOfGuests, setNumberOfGuests] = useState<number>(
    Number(searchParams?.get("guests")) || 1
  );
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash">("cash");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      if (user.name) setGuestName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
    }
  }, [user]);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;
      setLoadingRoom(true);
      try {
        const response = await getRoomByIdApi(roomId);
        if (response.success && response.data) {
          setRoom(response.data);
          setNumberOfGuests((prev) => Math.min(prev, response.data.maxGuests) || 1);
        }
      } catch (err) {
        setErrorMsg("Failed to load room specifications.");
      } finally {
        setLoadingRoom(false);
      }
    };
    fetchRoom();
  }, [roomId]);

  // Calculate nights and total price
  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) return null;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
    const nights = Math.max(
      1,
      Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return {
      nights,
      total: nights * room.pricePerNight,
    };
  };

  const costBreakdown = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!guestName || !email || !phone || !checkInDate || !checkOutDate) {
      setErrorMsg("Please fill in all required guest & booking fields.");
      return;
    }

    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      setErrorMsg("Check-out date must be strictly after Check-in date.");
      return;
    }

    if (checkInDate < todayStr) {
      setErrorMsg("Check-in date cannot be in the past.");
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === "online") {
        // No reservation is created here — Stripe confirms payment first via webhook,
        // so an abandoned checkout never blocks the room or leaves a phantom booking.
        const checkoutResponse = await createOnlineBookingCheckoutApi({
          guestName,
          email,
          phone,
          room: roomId,
          checkInDate,
          checkOutDate,
          numberOfGuests,
          specialRequests,
        });

        if (checkoutResponse.success && checkoutResponse.data?.url) {
          window.location.href = checkoutResponse.data.url;
          return;
        }
        setErrorMsg(checkoutResponse.message || "Failed to start payment session.");
        setSubmitting(false);
        return;
      }

      const response = await createReservationApi({
        guestName,
        email,
        phone,
        room: roomId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        specialRequests,
        paymentMethod,
      });

      if (!response.success || !response.data) {
        setErrorMsg(response.message || "Failed to complete reservation.");
        setSubmitting(false);
        return;
      }

      setSuccessBooking(response.data);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "An error occurred while creating your reservation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={roomId ? `/rooms/${roomId}` : "/rooms"}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Room
        </Link>

        {searchParams?.get("payment") === "cancelled" && !successBooking && (
          <div className="max-w-3xl mx-auto mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Payment was cancelled — nothing was charged and no booking was made. Feel free to try again.
          </div>
        )}

        {/* Successful Booking View */}
        {successBooking ? (
          <div className="glass-panel p-10 rounded-3xl border border-emerald-500/30 text-center my-6 max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <Badge variant="gold" size="md" className="mb-2">
                Booking Confirmed
              </Badge>
              <h2 className="text-3xl font-extrabold text-white font-outfit">
                Reservation #{successBooking.bookingId}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Thank you for choosing GrandStay Hotels. A confirmation email is on its way to{" "}
                <span className="text-amber-400 font-semibold">{successBooking.email}</span>. You can
                also view full details anytime under{" "}
                <span className="text-amber-400 font-semibold">My Bookings</span>.
              </p>
            </div>

            <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 text-left space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Guest Name:</span>
                <span className="text-white font-semibold">{successBooking.guestName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Check-in:</span>
                <span className="text-white font-semibold">
                  {new Date(successBooking.checkInDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Check-out:</span>
                <span className="text-white font-semibold">
                  {new Date(successBooking.checkOutDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span className="text-white">Total Amount:</span>
                <span className="text-amber-400 text-lg">${successBooking.totalAmount}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Link href="/my-bookings" className="flex-1">
                <Button variant="gold" className="w-full">
                  View My Bookings
                </Button>
              </Link>
              <Link href="/rooms" className="flex-1">
                <Button variant="outline" className="w-full">
                  Browse More Rooms
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
                <div>
                  <h1 className="text-3xl font-extrabold font-outfit text-white">Guest Checkout</h1>
                  <p className="text-slate-400 text-sm">
                    Enter your details to complete your reservation.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Reservation Error</p>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Guest Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400" /> Full Guest Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+1-555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-in Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          if (checkOutDate && checkOutDate <= e.target.value) setCheckOutDate("");
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-out Date *
                      </label>
                      <input
                        type="date"
                        required
                        min={checkInDate || todayStr}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Number of Guests *
                    </label>
                    <select
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {Array.from({ length: room?.maxGuests || 1 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num} Guest{num > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                    {room && (
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        This room accommodates up to {room.maxGuests} guest{room.maxGuests > 1 ? "s" : ""}.
                      </p>
                    )}
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" /> Special Requests (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Early check-in, high floor preference..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Payment Method *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cash")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          paymentMethod === "cash"
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <Banknote className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Pay at Hotel</p>
                          <p className="text-[11px] opacity-80">Cash on arrival</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                          paymentMethod === "online"
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                            : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-bold">Pay Online</p>
                          <p className="text-[11px] opacity-80">Card via Stripe</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Button variant="gold" size="lg" className="w-full font-bold" disabled={submitting}>
                    {submitting
                      ? paymentMethod === "online"
                        ? "Redirecting to Payment..."
                        : "Processing Reservation..."
                      : paymentMethod === "online"
                      ? "Proceed to Payment"
                      : "Confirm & Book Now"}
                  </Button>
                </form>
              </div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 sticky top-28 space-y-6">
                <h3 className="font-bold text-white text-lg font-outfit pb-3 border-b border-slate-800">
                  Reservation Summary
                </h3>

                {loadingRoom || !room ? (
                  <p className="text-slate-400 text-sm">Loading summary...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <img
                        src={room.images[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80"}
                        alt={room.roomNumber}
                        className="w-20 h-20 rounded-xl object-cover border border-slate-800"
                      />
                      <div>
                        <Badge variant="gold" size="sm" className="mb-1">
                          Room {room.roomNumber}
                        </Badge>
                        <h4 className="font-bold text-white text-sm">{room.roomType} Room</h4>
                        <p className="text-xs text-amber-400 font-bold mt-1">${room.pricePerNight} / night</p>
                      </div>
                    </div>

                    {costBreakdown ? (
                      <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-400 text-xs">
                          <span>Rate per Night:</span>
                          <span>${room.pricePerNight}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-xs">
                          <span>Total Stay Duration:</span>
                          <span>{costBreakdown.nights} Night(s)</span>
                        </div>
                        <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white text-base">
                          <span>Total Amount:</span>
                          <span className="text-amber-400">${costBreakdown.total}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-400">Please select valid Check-in & Check-out dates.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
