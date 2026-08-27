"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { useAppSelector } from "../../store/hooks";
import { getRoomByIdApi } from "../../api/roomApi";
import { createReservationApi } from "../../api/reservationApi";
import { createOnlineBookingCheckoutApi } from "../../api/paymentApi";
import { RoomData } from "../../store/slices/roomsSlice";

const ROOM_FALLBACK =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=400&q=80";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "placeholder-muted focus:outline-none focus:border-b-2 focus:border-pine transition-colors";
const labelCls = "font-mono text-2xs uppercase tracking-widest text-muted";
const sectionLabel = "font-mono text-2xs uppercase tracking-[0.2em] text-brass";

export default function BookingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted">Loading…</p>
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

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) return null;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
    const nights = Math.max(
      1,
      Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { nights, total: nights * room.pricePerNight };
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
      setErrorMsg("Check-out date must be strictly after check-in date.");
      return;
    }
    if (checkInDate < todayStr) {
      setErrorMsg("Check-in date cannot be in the past.");
      return;
    }

    setSubmitting(true);
    try {
      if (paymentMethod === "online") {
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
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href={roomId ? `/rooms/${roomId}` : "/rooms"}
          className="font-mono text-2xs uppercase tracking-widest text-muted hover:text-pine transition-colors"
        >
          ← Back to room
        </Link>

        {searchParams?.get("payment") === "cancelled" && !successBooking && (
          <p className="mt-6 border-l-2 border-brass pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-brass leading-relaxed">
            Payment cancelled — nothing was charged and no booking was made.
          </p>
        )}

        {successBooking ? (
          /* ---------- Printed confirmation ---------- */
          <div className="mt-10 max-w-xl border border-rule bg-paper-2 p-8">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-pine">
              Reservation confirmed
            </p>
            <h1 className="mt-2 font-display font-medium text-4xl text-ink tabular">
              {successBooking.bookingId}
            </h1>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              A confirmation is on its way to{" "}
              <span className="text-ink">{successBooking.email}</span>. Full details live under
              My Bookings.
            </p>

            <dl className="mt-6 border-t border-rule font-mono text-sm">
              {[
                ["Guest", successBooking.guestName],
                ["Arrival", new Date(successBooking.checkInDate).toLocaleDateString("en-GB")],
                ["Departure", new Date(successBooking.checkOutDate).toLocaleDateString("en-GB")],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-rule">
                  <dt className="text-2xs uppercase tracking-widest text-muted">{k}</dt>
                  <dd className="tabular text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between items-baseline py-3">
                <dt className="text-2xs uppercase tracking-widest text-muted">Total</dt>
                <dd className="font-display text-2xl text-ink tabular">
                  ${successBooking.totalAmount}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex gap-3">
              <Link href="/my-bookings">
                <Button variant="primary" size="sm">View my bookings</Button>
              </Link>
              <Link href="/rooms">
                <Button variant="secondary" size="sm">Browse more rooms</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-x-12 gap-y-10">
            {/* ---------- Form ---------- */}
            <div>
              <h1 className="font-display font-medium text-4xl leading-[0.98] text-ink">
                Guest checkout
              </h1>
              <p className="mt-3 text-sm text-ink-soft">
                Enter your details to complete the reservation.
              </p>

              {errorMsg && (
                <p className="mt-6 border-l-2 border-stop pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-stop leading-relaxed">
                  {errorMsg}
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col">
                {/* Guest */}
                <p className={sectionLabel}>Guest</p>
                <div className="mt-4 pb-8 border-b border-rule grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <label className="flex flex-col gap-1.5 sm:col-span-2">
                    <span className={labelCls}>Full name *</span>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Email *</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Phone *</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={field}
                    />
                  </label>
                </div>

                {/* Dates */}
                <p className={`${sectionLabel} mt-8`}>Dates</p>
                <div className="mt-4 pb-8 border-b border-rule grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-5">
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Arrival *</span>
                    <input
                      type="date"
                      required
                      min={todayStr}
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        if (checkOutDate && checkOutDate <= e.target.value) setCheckOutDate("");
                      }}
                      className={field}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Departure *</span>
                    <input
                      type="date"
                      required
                      min={checkInDate || todayStr}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className={field}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className={labelCls}>Guests *</span>
                    <select
                      value={numberOfGuests}
                      onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                      className={field}
                    >
                      {Array.from({ length: room?.maxGuests || 1 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Requests */}
                <p className={`${sectionLabel} mt-8`}>Requests</p>
                <label className="mt-4 pb-8 border-b border-rule flex flex-col gap-1.5">
                  <span className={labelCls}>Special requests (optional)</span>
                  <textarea
                    rows={3}
                    placeholder="Early check-in, high floor…"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className={`${field} resize-none`}
                  />
                </label>

                {/* Payment */}
                <p className={`${sectionLabel} mt-8`}>Payment</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    ["cash", "Pay at hotel", "Cash on arrival"],
                    ["online", "Pay online", "Card via Stripe"],
                  ] as const).map(([value, title, sub]) => {
                    const active = paymentMethod === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPaymentMethod(value)}
                        className={`text-left p-4 border transition-colors ${
                          active
                            ? "border-pine text-pine bg-paper-2"
                            : "border-rule text-ink-soft hover:border-muted"
                        }`}
                      >
                        <p className="font-mono text-2xs uppercase tracking-widest">{title}</p>
                        <p className="text-2xs text-muted mt-1">{sub}</p>
                      </button>
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-8"
                  disabled={submitting}
                >
                  {submitting
                    ? paymentMethod === "online"
                      ? "Redirecting…"
                      : "Processing…"
                    : paymentMethod === "online"
                    ? "Proceed to payment"
                    : "Confirm & book"}
                </Button>
              </form>
            </div>

            {/* ---------- Receipt ---------- */}
            <aside className="lg:sticky lg:top-20 self-start border border-rule bg-paper-2 p-6">
              <p className={sectionLabel}>Summary</p>

              {loadingRoom || !room ? (
                <p className="mt-4 font-mono text-2xs uppercase tracking-widest text-muted">
                  Loading…
                </p>
              ) : (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex gap-3">
                    <img
                      src={room.images?.[0] || ROOM_FALLBACK}
                      alt={`Room ${room.roomNumber}`}
                      className="w-16 h-16 object-cover border border-rule"
                    />
                    <div className="font-mono text-2xs uppercase tracking-widest text-muted">
                      <p className="tabular">№ {room.roomNumber}</p>
                      <p className="text-ink mt-1">{room.roomType}</p>
                      <p className="mt-1 tabular">${room.pricePerNight}/night</p>
                    </div>
                  </div>

                  <div className="border-t border-rule pt-4 font-mono text-2xs">
                    {costBreakdown ? (
                      <>
                        <div className="flex justify-between text-muted uppercase tracking-widest">
                          <span>
                            ${room.pricePerNight} × <span className="tabular">{costBreakdown.nights}</span>
                          </span>
                          <span className="tabular text-ink-soft">${costBreakdown.total}</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-3 pt-3 border-t border-rule">
                          <span className="uppercase tracking-widest text-muted">Total</span>
                          <span className="font-display text-2xl text-ink tabular">
                            ${costBreakdown.total}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="uppercase tracking-widest text-brass">
                        Select valid dates for a total.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
