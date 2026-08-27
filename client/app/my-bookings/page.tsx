"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { useAppSelector } from "../store/hooks";
import { getMyBookingsApi } from "../api/reservationApi";
import { ReservationData } from "../store/slices/reservationsSlice";

export default function MyBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAppSelector((state) => state.auth);

  const [bookings, setBookings] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await getMyBookingsApi();
        if (response.success && Array.isArray(response.data)) {
          setBookings(response.data);
        } else {
          setBookings([]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load your reservations.");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchBookings();
  }, [isAuthenticated, authLoading]);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <section className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-4">
            Guest Portal
          </p>
          <h1 className="font-display font-medium text-3xl sm:text-5xl leading-[0.98] text-ink">
            Your reservations
          </h1>
          <p className="mt-5 text-base text-ink-soft max-w-lg leading-relaxed">
            Every stay you&rsquo;ve booked with GrandStay, with its live status.
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isAuthenticated && !authLoading ? (
          <div className="max-w-md">
            <h2 className="font-display font-medium text-2xl text-ink">
              Log in to see your bookings.
            </h2>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              Sign in with your guest account to review your reservation history and status.
            </p>
            <Link href="/login" className="inline-block mt-5">
              <Button variant="primary" size="sm">Log in</Button>
            </Link>
          </div>
        ) : loading ? (
          <p className="font-mono text-2xs uppercase tracking-widest text-muted">Loading…</p>
        ) : error ? (
          <h2 className="font-display font-medium text-xl text-stop">{error}</h2>
        ) : bookings.length === 0 ? (
          <div className="max-w-md">
            <h2 className="font-display font-medium text-2xl text-ink">No reservations yet.</h2>
            <p className="mt-3 text-sm text-ink-soft leading-relaxed">
              You haven&rsquo;t booked a stay. Browse the house to plan your first.
            </p>
            <Link href="/rooms" className="inline-block mt-5">
              <Button variant="primary" size="sm">Explore rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="border-t border-rule">
            {bookings.map((booking) => {
              const roomObj = typeof booking.room === "object" ? booking.room : null;
              return (
                <Link
                  key={booking._id}
                  href={`/my-bookings/${booking._id}`}
                  className="group grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-x-6 gap-y-2 items-baseline py-5 border-b border-rule"
                >
                  <span className="font-mono text-2xs uppercase tracking-widest text-muted tabular">
                    {new Date(booking.checkInDate).toLocaleDateString("en-GB")} –{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString("en-GB")}
                  </span>

                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-lg text-ink group-hover:text-pine transition-colors">
                      {roomObj ? `${roomObj.roomType} Room` : "Hotel Room"}
                    </span>
                    <span className="font-mono text-2xs uppercase tracking-widest text-muted tabular">
                      № {booking.bookingId}
                    </span>
                    <Badge variant={booking.status} size="sm">{booking.status}</Badge>
                  </span>

                  <span className="font-mono text-sm text-ink tabular sm:text-right">
                    ${booking.totalAmount}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
