"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { getRoomsApi, RoomFilterParams } from "../api/roomApi";
import { RoomData } from "../store/slices/roomsSlice";

const ROOM_FALLBACK =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";

const statusTone: Record<string, string> = {
  Available: "text-pine",
  Reserved: "text-brass",
  Occupied: "text-muted",
  Maintenance: "text-stop",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [roomType, setRoomType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [guests, setGuests] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchRoomsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: RoomFilterParams = {};
      if (roomType) params.roomType = roomType;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (guests) params.guests = Number(guests);
      if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
        params.checkInDate = checkInDate;
        params.checkOutDate = checkOutDate;
      }

      const response = await getRoomsApi(params);
      if (response.success && Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, [roomType, minPrice, maxPrice, guests, checkInDate, checkOutDate]);

  useEffect(() => {
    fetchRoomsData();
  }, [fetchRoomsData]);

  const handleResetFilters = () => {
    setRoomType("");
    setMinPrice("");
    setMaxPrice("");
    setGuests("");
    setCheckInDate("");
    setCheckOutDate("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink overflow-x-hidden">
      <Navbar />

      {/* Header */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-4">
            The Rooms
          </p>
          <h1 className="font-display font-medium text-3xl sm:text-5xl leading-[0.98] text-ink max-w-2xl">
            Every room in the house, and whether it&rsquo;s free.
          </h1>
          <p className="mt-5 text-base text-ink-soft max-w-lg leading-relaxed">
            Set your dates to hide anything already booked. Availability is live.
          </p>
        </div>
      </section>

      {/* Catalogue */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-x-12 gap-y-10">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-rule pb-3">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Filter</span>
                <button
                  onClick={handleResetFilters}
                  className="font-mono text-2xs uppercase tracking-widest text-pine hover:underline"
                >
                  Reset
                </button>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Arrival</span>
                <input
                  type="date"
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
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Departure</span>
                <input
                  type="date"
                  min={checkInDate || todayStr}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className={field}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Category</span>
                <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className={field}>
                  <option value="">All</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Executive">Executive</option>
                  <option value="Family">Family</option>
                  <option value="Suite">Presidential Suite</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Guests</span>
                <select value={guests} onChange={(e) => setGuests(e.target.value)} className={field}>
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </label>

              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Price / night</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={field}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className={field}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <p className="font-mono text-2xs uppercase tracking-widest text-muted py-10">
                Searching…
              </p>
            ) : error ? (
              <div className="py-10 max-w-md">
                <h3 className="font-display font-medium text-xl text-stop">{error}</h3>
                <button
                  onClick={fetchRoomsData}
                  className="mt-4 font-mono text-2xs uppercase tracking-widest text-pine border-b border-pine pb-0.5"
                >
                  Try again
                </button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="py-10 max-w-md">
                <h3 className="font-display font-medium text-2xl text-ink">
                  Nothing matches that.
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  No rooms fit your dates or filters. Widen the range or clear the filters
                  to see the whole house.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-block mt-5 font-mono text-2xs uppercase tracking-widest text-pine border-b border-pine pb-0.5"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {rooms.map((room, idx) => {
                  const status = (room as any).currentStatus as string | undefined;
                  const booked = room.reservedDates && room.reservedDates.length > 0;
                  return (
                    <article
                      key={room._id}
                      className={`group grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-6 py-8 ${
                        idx > 0 ? "border-t border-rule" : ""
                      }`}
                    >
                      <Link href={`/rooms/${room._id}`} className="block aspect-[3/2] overflow-hidden border border-rule bg-paper-2">
                        <img
                          src={room.images?.[0] || ROOM_FALLBACK}
                          alt={`Room ${room.roomNumber}`}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="flex flex-col gap-2">
                        <p className="font-mono text-2xs uppercase tracking-widest text-muted">
                          <span className="tabular">№ {room.roomNumber}</span> · Sleeps{" "}
                          <span className="tabular">{room.maxGuests}</span> · from{" "}
                          <span className="tabular">${room.pricePerNight}</span> / night
                          {status && (
                            <>
                              {"  ·  "}
                              <span className={statusTone[status] || "text-muted"}>{status}</span>
                            </>
                          )}
                        </p>

                        <h2 className="font-display font-medium text-2xl text-ink">
                          <Link
                            href={`/rooms/${room._id}`}
                            className="border-b border-transparent group-hover:border-pine transition-colors"
                          >
                            {room.roomType} Room{room.bedType ? ` · ${room.bedType}` : ""}
                          </Link>
                        </h2>

                        <p className="text-sm text-ink-soft leading-relaxed line-clamp-2 max-w-prose">
                          {room.description}
                        </p>

                        {room.facilities && room.facilities.length > 0 && (
                          <p className="font-mono text-2xs uppercase tracking-wider text-muted mt-1">
                            {room.facilities.slice(0, 5).join("  ·  ")}
                          </p>
                        )}

                        {booked && room.reservedDates?.[0] && (
                          <p className="font-mono text-2xs uppercase tracking-widest text-brass mt-1">
                            Held{" "}
                            <span className="tabular">
                              {new Date(room.reservedDates[0].checkInDate).toLocaleDateString("en-GB")}
                            </span>{" "}
                            –{" "}
                            <span className="tabular">
                              {new Date(room.reservedDates[0].checkOutDate).toLocaleDateString("en-GB")}
                            </span>
                          </p>
                        )}

                        <div className="mt-3">
                          <Link href={`/rooms/${room._id}`}>
                            <Button variant="primary" size="sm">View &amp; reserve</Button>
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
