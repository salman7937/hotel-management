"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Button } from "./components/common/Button";
import { getRoomsApi } from "./api/roomApi";

const HERO_IMG =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80";
const ROOM_FALLBACK =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80";

const fieldClass =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";

export default function Home() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const todayStr = new Date().toISOString().split("T")[0];

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
          setFeaturedRooms(response.data.slice(0, 3));
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
    <div className="min-h-screen flex flex-col bg-paper text-ink overflow-x-hidden">
      <Navbar />

      {/* ---------- Hero ---------- */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2">
          {/* Left — headline + search */}
          <div className="py-16 lg:py-24 lg:pr-14 flex flex-col justify-center">
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-6">
              GrandStay Hotels — Est. 1926
            </p>
            <h1 className="font-display font-medium text-4xl sm:text-5xl leading-[0.98] tracking-tight text-ink">
              Rooms with a hundred
              <br />
              years of taste.
            </h1>
            <p className="mt-6 text-base text-ink-soft max-w-md leading-relaxed">
              Browse the house, check real dates, and hold a room in about a minute.
              No membership, no games with the price.
            </p>

            <form
              onSubmit={handleSearch}
              className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-4 items-end"
            >
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Arrival</span>
                <input
                  type="date"
                  min={todayStr}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && checkOut <= e.target.value) setCheckOut("");
                  }}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Departure</span>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Guests</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className={fieldClass}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </label>
              <Button type="submit" variant="primary" className="w-full">
                Check availability
              </Button>
            </form>
          </div>

          {/* Right — one room, one caption */}
          <div className="lg:border-l border-rule lg:pl-14 py-16 lg:py-24 flex flex-col justify-center">
            <div className="aspect-[4/5] w-full overflow-hidden border border-rule bg-paper-2">
              <img
                src={HERO_IMG}
                alt="A made-up room at GrandStay Hotels"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="mt-3 font-mono text-2xs uppercase tracking-widest text-muted">
              Room 214 · Garden Deluxe · from <span className="tabular">$180</span> / night
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Featured rooms ---------- */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-3">
                01 — The Rooms
              </p>
              <h2 className="font-display font-medium text-2xl sm:text-3xl text-ink">
                In residence this season
              </h2>
            </div>
            <Link href="/rooms" className="font-mono text-2xs uppercase tracking-widest text-pine border-b border-pine pb-0.5 whitespace-nowrap">
              All rooms
            </Link>
          </div>

          {loadingRooms ? (
            <p className="font-mono text-2xs uppercase tracking-widest text-muted py-10">
              Loading rooms…
            </p>
          ) : featuredRooms.length === 0 ? (
            <div className="py-10 max-w-md">
              <h3 className="font-display font-medium text-2xl text-ink">
                No rooms are listed right now.
              </h3>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                The house is being updated. Check back shortly, or call the front desk and
                we&rsquo;ll arrange your stay by hand.
              </p>
              <Link
                href="/rooms"
                className="inline-block mt-5 font-mono text-2xs uppercase tracking-widest text-pine border-b border-pine pb-0.5"
              >
                Browse all rooms
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {featuredRooms.map((room) => {
                const booked = room.reservedDates && room.reservedDates.length > 0;
                return (
                  <Link
                    key={room._id}
                    href={`/rooms/${room._id}`}
                    className="group flex flex-col border border-rule bg-paper-2"
                  >
                    <div className="aspect-[3/2] w-full overflow-hidden bg-paper">
                      <img
                        src={room.images?.[0] || ROOM_FALLBACK}
                        alt={`Room ${room.roomNumber}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="border-t border-rule p-5 flex flex-col gap-2 flex-1">
                      <p className="font-mono text-2xs uppercase tracking-widest text-muted">
                        <span className="tabular">№ {room.roomNumber}</span> · Sleeps{" "}
                        <span className="tabular">{room.maxGuests}</span> ·{" "}
                        <span className="tabular">${room.pricePerNight}</span>/night
                      </p>
                      <h3 className="font-display font-medium text-xl text-ink">
                        <span className="border-b border-transparent group-hover:border-pine transition-colors">
                          {room.roomType} Room
                        </span>
                      </h3>
                      <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">
                        {room.description}
                      </p>
                      {booked && (
                        <p className="mt-auto font-mono text-2xs uppercase tracking-widest text-brass">
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
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ---------- The House ---------- */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-3">
            02 — The House
          </p>
          <h2 className="font-display font-medium text-2xl sm:text-3xl text-ink mb-10">
            What a night here includes
          </h2>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
            {[
              ["01", "Gigabit wi-fi, everywhere", "The same wireless in the garden as in the executive suites. It just works."],
              ["02", "Breakfast, made that morning", "Artisan pastries, real espresso, and a buffet cooked fresh — not held under a lamp."],
              ["03", "A concierge on every shift", "Round-the-clock front desk, keycard security, and requests read by a person."],
            ].map(([n, title, body]) => (
              <li key={n} className="flex flex-col gap-2">
                <span className="font-mono text-2xs text-muted tabular">{n}</span>
                <h3 className="font-display font-medium text-lg text-ink">{title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Reservations ---------- */}
      <section>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-3">
            03 — Reservations
          </p>
          <h2 className="font-display font-medium text-3xl sm:text-4xl leading-tight text-ink">
            Book direct. It&rsquo;s the best rate we offer.
          </h2>
          <p className="mt-5 text-base text-ink-soft leading-relaxed max-w-xl">
            Instant confirmation, every special request read by a person, and no booking fee
            between you and the room.
          </p>
          <Link href="/rooms" className="inline-block mt-8">
            <Button variant="primary" size="lg">Reserve a room</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
