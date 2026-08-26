"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { getRoomsApi, RoomFilterParams } from "../api/roomApi";
import { RoomData } from "../store/slices/roomsSlice";
import {
  Search,
  Filter,
  Calendar,
  Users,
  BedDouble,
  DollarSign,
  Wifi,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [roomType, setRoomType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [guests, setGuests] = useState<string>("");
  const [checkInDate, setCheckInDate] = useState<string>("");
  const [checkOutDate, setCheckOutDate] = useState<string>("");

  const fetchRoomsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: RoomFilterParams = {};
      if (roomType) params.roomType = roomType;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      if (guests) params.guests = Number(guests);
      if (checkInDate) params.checkInDate = checkInDate;
      if (checkOutDate) params.checkOutDate = checkOutDate;

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      <Navbar />

      {/* Header Banner */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-slate-900/80 to-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Luxury Accommodations</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-white font-outfit"
          >
            Find & Book Your Ideal Room
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-sm"
          >
            Browse our curated collection of luxury hotel rooms, executive suites, and family spaces. Real-time availability guaranteed.
          </motion.p>
        </div>
      </section>

      {/* Main Catalog Section */}
      <section className="py-12 px-4 flex-1">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filter Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6 sticky top-28">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-500" />
                  <h2 className="font-bold text-white text-base">Filter Rooms</h2>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Date Filters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Room Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-amber-400" /> Room Category
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Standard">Standard Room</option>
                    <option value="Deluxe">Deluxe Room</option>
                    <option value="Executive">Executive Suite</option>
                    <option value="Family">Family Room</option>
                    <option value="Suite">Presidential Suite</option>
                  </select>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Min Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Any Guests</option>
                    <option value="1">1+ Guest</option>
                    <option value="2">2+ Guests</option>
                    <option value="3">3+ Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Price Range ($ / Night)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Rooms Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 text-sm">Searching available luxury rooms...</p>
              </div>
            ) : error ? (
              <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center my-6">
                <p className="text-rose-400 font-semibold mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchRoomsData}>
                  Try Again
                </Button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center my-6">
                <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Rooms Found</h3>
                <p className="text-slate-400 max-w-md mx-auto mb-6 text-sm">
                  We couldn't find any rooms matching your search criteria or date availability. Try modifying your dates or resetting filters.
                </p>
                <Button variant="gold" onClick={handleResetFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rooms.map((room, idx) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="glass-panel rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col group"
                  >
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={room.images[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"}
                        alt={room.roomNumber}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="gold" size="sm">
                          Room {room.roomNumber}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                        <Badge variant="default" size="sm" className="bg-slate-900/80 backdrop-blur-md">
                          {room.roomType}
                        </Badge>
                        {room.reservedDates && room.reservedDates.length > 0 && (
                          <Badge variant="outline" size="sm" className="bg-amber-950/80 border-amber-500/50 text-amber-300 text-[10px]">
                            📅 Booked: {new Date(room.reservedDates[0].checkInDate).toLocaleDateString()} – {new Date(room.reservedDates[0].checkOutDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>Up to {room.maxGuests} Guests</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-amber-400">${room.pricePerNight}</span>
                          <span className="text-[10px] text-slate-400 uppercase"> / night</span>
                        </div>
                      </div>
                    </div>

                    {/* Room Info */}
                    <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {room.roomType} Suite ({room.bedType})
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>

                        {/* Facilities tags */}
                        {room.facilities && room.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {room.facilities.slice(0, 4).map((facility, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400"
                              >
                                {facility}
                              </span>
                            ))}
                            {room.facilities.length > 4 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-500">
                                +{room.facilities.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                        <Link href={`/rooms/${room._id}`} className="w-full">
                          <Button
                            variant="gold"
                            className="w-full"
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                          >
                            View & Reserve
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
