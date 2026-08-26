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
import {
  CalendarCheck,
  Calendar,
  BedDouble,
  User,
  Clock,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function MyBookingsPage() {
  const { isAuthenticated, user, isLoading: authLoading } = useAppSelector((state) => state.auth);

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

    if (!authLoading) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading]);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Checked-in":
        return "gold";
      case "Checked-out":
        return "default";
      case "Cancelled":
        return "danger";
      case "Pending":
      default:
        return "warning";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      {/* Header Banner */}
      <div className="relative py-14 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge variant="gold" size="md" className="mb-3">
            <CalendarCheck className="w-3.5 h-3.5 mr-1 text-amber-400 inline" /> Customer Portal
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white tracking-tight mb-2">
            My Reservations & <span className="gold-gradient-text">Bookings</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            View and manage your hotel reservation history and live booking statuses.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!isAuthenticated && !authLoading ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center max-w-md mx-auto my-10 space-y-4">
            <User className="w-12 h-12 text-slate-500 mx-auto" />
            <h2 className="text-xl font-bold text-white">Log in to view your bookings</h2>
            <p className="text-slate-400 text-sm">
              Please sign in with your customer account to access your reservation history.
            </p>
            <Link href="/login">
              <Button variant="gold" className="w-full">
                Log In Now
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Retrieving your reservation history...</p>
          </div>
        ) : error ? (
          <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center my-6">
            <p className="text-rose-400 font-semibold mb-2">{error}</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto my-6 space-y-4">
            <Info className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Reservations Found</h3>
            <p className="text-slate-400 text-sm">
              You haven't made any hotel reservations yet. Browse our luxury rooms to plan your upcoming stay!
            </p>
            <Link href="/rooms">
              <Button variant="gold">Explore Rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const roomObj = typeof booking.room === "object" ? booking.room : null;
              return (
                <Link
                  key={booking._id}
                  href={`/my-bookings/${booking._id}`}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-1">
                      <BedDouble className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-white text-lg font-outfit">
                          #{booking.bookingId}
                        </span>
                        <Badge variant={getBadgeVariant(booking.status)} size="sm">
                          {booking.status}
                        </Badge>
                      </div>

                      <p className="text-sm font-semibold text-slate-200">
                        {roomObj ? `${roomObj.roomType} Room (${roomObj.roomNumber})` : "Hotel Room"}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          {new Date(booking.checkInDate).toLocaleDateString()} ➔{" "}
                          {new Date(booking.checkOutDate).toLocaleDateString()}
                        </span>
                        <span>• {booking.numberOfGuests} Guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-2xl font-extrabold text-amber-400">${booking.totalAmount}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">Total Paid/Due</span>
                    </div>
                  </div>
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
