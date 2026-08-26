"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { getRoomByIdApi } from "../../api/roomApi";
import { RoomData } from "../../store/slices/roomsSlice";
import {
  BedDouble,
  Users,
  Wifi,
  Coffee,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Star,
  Info,
} from "lucide-react";

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [room, setRoom] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!roomId) return;
      setLoading(true);
      try {
        const response = await getRoomByIdApi(roomId);
        if (response.success && response.data) {
          setRoom(response.data);
        } else {
          setError("Room details could not be found.");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load room details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [roomId]);

  // Calculate nights and total price
  const calculateTotal = () => {
    if (!checkIn || !checkOut || !room) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (end <= start) return null;
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return {
      nights,
      total: nights * room.pricePerNight,
    };
  };

  const costBreakdown = calculateTotal();

  const isConflict = React.useMemo(() => {
    if (!checkIn || !checkOut || !room?.reservedDates) return false;
    const userStart = new Date(checkIn);
    const userEnd = new Date(checkOut);
    return room.reservedDates.some((res: any) => {
      const resStart = new Date(res.checkInDate);
      const resEnd = new Date(res.checkOutDate);
      return userStart < resEnd && userEnd > resStart;
    });
  }, [checkIn, checkOut, room]);

  const handleProceedBooking = () => {
    if (!roomId || isConflict) return;
    const query = new URLSearchParams();
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests.toString());
    router.push(`/book/${roomId}?${query.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Link */}
        <Link
          href="/rooms"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Room Catalog
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading room specifications...</p>
          </div>
        ) : error || !room ? (
          <div className="glass-panel p-10 rounded-2xl border border-rose-900/50 text-center my-10">
            <Info className="w-12 h-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Room Not Found</h2>
            <p className="text-slate-400 mb-6 text-sm">{error || "The requested room does not exist."}</p>
            <Link href="/rooms">
              <Button variant="gold">Browse All Rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Images & Specs */}
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery Image Header */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-96 sm:h-[450px]">
                <img
                  src={
                    room.images[0] ||
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={room.roomNumber}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="gold" size="md">
                    Room {room.roomNumber}
                  </Badge>
                  <Badge variant="default" size="md" className="bg-slate-950/80 backdrop-blur-md">
                    {room.roomType}
                  </Badge>
                </div>
              </div>

              {/* Title & Overview */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white">
                    {room.roomType} Suite - Room {room.roomNumber}
                  </h1>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-amber-400">${room.pricePerNight}</span>
                    <span className="text-xs text-slate-400 block">per night</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 py-3 border-y border-slate-800 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Capacity: {room.maxGuests} Guests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-amber-400" />
                    <span>Bed: {room.bedType}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-base leading-relaxed mt-6">{room.description}</p>
              </div>

              {/* Facilities Section */}
              <div>
                <h3 className="text-xl font-bold text-white font-outfit mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Room Amenities & Services
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {room.facilities.map((facility, idx) => (
                    <div
                      key={idx}
                      className="glass-panel p-3.5 rounded-xl border border-slate-800 flex items-center gap-3 text-slate-200 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Reservation Booking Box */}
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 sticky top-28 space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white font-outfit mb-1">Reserve This Room</h3>
                  <p className="text-xs text-slate-400">Select dates for live price calculation.</p>
                </div>

                {/* Already Reserved Date Ranges Banner */}
                {room.reservedDates && room.reservedDates.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-400">
                      <Calendar className="w-4 h-4" /> Unavailable Date Ranges:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200">
                      {room.reservedDates.map((res: any, idx: number) => (
                        <li key={idx}>
                          {new Date(res.checkInDate).toLocaleDateString()} to {new Date(res.checkOutDate).toLocaleDateString()} ({res.status})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Date Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-in Date
                    </label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-out Date
                    </label>
                    <input
                      type="date"
                      min={checkIn || undefined}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-amber-400" /> Number of Guests
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} Guest{n > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cost Calculation Summary */}
                {costBreakdown && (
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>${room.pricePerNight} × {costBreakdown.nights} Night(s)</span>
                      <span>${costBreakdown.total}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                      <span>Total Price</span>
                      <span className="text-amber-400">${costBreakdown.total}</span>
                    </div>
                  </div>
                )}

                {/* Date Conflict Warning Banner */}
                {isConflict && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold leading-relaxed">
                    ⚠️ Room is already reserved for the selected dates. Please pick different check-in/check-out dates.
                  </div>
                )}

                {/* Submit Action */}
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  disabled={isConflict}
                  onClick={handleProceedBooking}
                >
                  {isConflict ? "Dates Unavailable" : "Proceed to Booking"}
                </Button>

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Instant confirmation & double-booking protected
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
