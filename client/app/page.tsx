"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Button } from "./components/common/Button";
import { getRoomsApi } from "./api/roomApi";
import {
  Calendar,
  Users,
  Search,
  BedDouble,
  Wifi,
  Coffee,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests);
    router.push(`/rooms?${query.toString()}`);
  };

  const [featuredRooms, setFeaturedRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await getRoomsApi({});
        if (response.success && Array.isArray(response.data)) {
          setFeaturedRooms(response.data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load featured rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden py-20 px-4">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center filter brightness-[0.35]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Welcome to GrandStay Hotels</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight font-outfit leading-tight"
          >
            Experience Unmatched <br />
            <span className="gold-gradient-text">Luxury & Hospitality</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed"
          >
            Discover modern elegance, handcrafted comfort, and seamless online room reservations. Your perfect getaway begins right here.
          </motion.p>

          {/* Search Widget - Aligned Button & Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto pt-6"
          >
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/90 shadow-2xl shadow-slate-950 backdrop-blur-xl">
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                <div className="text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div className="text-left">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-amber-500" />
                    Guests
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 text-slate-100 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>

                {/* Search Button Container - Aligned Level with Inputs */}
                <div className="sm:col-span-3 lg:col-span-1 flex flex-col justify-end">
                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full py-3 h-[46px] text-sm font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
                    leftIcon={<Search className="w-4 h-4" />}
                  >
                    Check Availability
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 px-4 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16 space-y-3"
          >
            <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Why Stay With Us</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">World-Class Hotel Features</h3>
            <p className="text-slate-400 text-sm">
              We provide unmatched hospitality services designed to elevate your stay to Extraordinary.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-2xl glass-card border border-slate-800/80 space-y-4 hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Wifi className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Ultra High-Speed Wi-Fi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stay seamlessly connected across all rooms, suites, and outdoor gardens with gigabit wireless coverage.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-8 rounded-2xl glass-card border border-slate-800/80 space-y-4 hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Gourmet Breakfast Included</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Indulge in fresh artisan pastries, organic espresso, and customized breakfast buffets prepared daily.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-2xl glass-card border border-slate-800/80 space-y-4 hover:border-amber-500/40 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">24/7 Butler & Security</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Round-the-clock concierge support, keycard security protocols, and personalized guest assistance.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Showcase */}
      <section className="py-20 px-4 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Our Accommodations</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-outfit mt-1">Explore Featured Rooms</h3>
            </div>
            <Link href="/rooms">
              <Button variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View All Rooms
              </Button>
            </Link>
          </div>

          {loadingRooms ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Loading featured rooms...
            </div>
          ) : featuredRooms.length === 0 ? (
            <div className="glass-card p-10 rounded-2xl text-center border border-slate-800 my-4">
              <p className="text-slate-300 font-semibold mb-2">No rooms available at the moment</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                Our rooms are currently being updated. Please check back soon or contact our front desk for assistance with your stay.
              </p>
              <Link href="/rooms">
                <Button variant="gold" size="sm">Browse All Rooms</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRooms.map((room, idx) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="group rounded-2xl glass-card overflow-hidden border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={room.images[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"}
                      alt={room.roomNumber}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {room.reservedDates && room.reservedDates.length > 0 && (
                      <div className="absolute top-3 left-3 bg-amber-950/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-300 text-[10px] font-bold shadow-lg">
                        📅 Booked: {new Date(room.reservedDates[0].checkInDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })} - {new Date(room.reservedDates[0].checkOutDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit" })}
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-amber-500/30 text-amber-400 text-xs font-bold">
                      ${room.pricePerNight} <span className="text-[10px] text-slate-400 font-normal">/ night</span>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                          {room.roomType} Room ({room.roomNumber})
                        </h4>
                      </div>
                      {room.reservedDates && room.reservedDates.length > 0 && (
                        <p className="text-[11px] font-semibold text-amber-400/90 mt-1">
                          📅 Reserved for {new Date(room.reservedDates[0].checkInDate).toLocaleDateString("en-GB")} to {new Date(room.reservedDates[0].checkOutDate).toLocaleDateString("en-GB")}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    </div>

                    <Link href={`/rooms/${room._id}`}>
                      <Button variant="secondary" size="sm" className="w-full">
                        Book This Room
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-950 border-t border-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-6"
        >
          <Award className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-outfit">
            Ready to Experience GrandStay Luxury?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto">
            Book directly through our official portal for instant confirmation, best price guarantee, and special guest requests.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/rooms">
              <Button variant="gold" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Reserve Your Stay Now
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
