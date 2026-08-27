"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/common/Button";
import { getRoomByIdApi } from "../../api/roomApi";
import { RoomData } from "../../store/slices/roomsSlice";

const ROOM_FALLBACK =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";

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

  const todayStr = new Date().toISOString().split("T")[0];

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

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !room) return null;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null;
    const nights = Math.max(
      1,
      Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { nights, total: nights * room.pricePerNight };
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

  const images = room?.images?.length ? room.images : [ROOM_FALLBACK];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/rooms"
          className="font-mono text-2xs uppercase tracking-widest text-muted hover:text-pine transition-colors"
        >
          ← All rooms
        </Link>

        {loading ? (
          <p className="font-mono text-2xs uppercase tracking-widest text-muted py-16">
            Loading room…
          </p>
        ) : error || !room ? (
          <div className="py-16 max-w-md">
            <h1 className="font-display font-medium text-3xl text-ink">Room not found.</h1>
            <p className="mt-3 text-sm text-ink-soft">
              {error || "The requested room does not exist."}
            </p>
            <Link href="/rooms" className="inline-block mt-5">
              <Button variant="primary" size="sm">Browse all rooms</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-x-14 gap-y-10">
            {/* Left — photography + copy */}
            <div className="flex flex-col gap-10">
              <div>
                <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-3">
                  <span className="tabular">№ {room.roomNumber}</span> · {room.roomType}
                </p>
                <h1 className="font-display font-medium text-4xl sm:text-5xl leading-[0.98] text-ink">
                  {room.roomType} Room
                </h1>
                <p className="mt-4 font-mono text-2xs uppercase tracking-widest text-muted">
                  Sleeps <span className="tabular">{room.maxGuests}</span> · {room.bedType} bed ·{" "}
                  <span className="tabular">${room.pricePerNight}</span> / night
                </p>
                <p className="mt-6 text-base text-ink-soft leading-relaxed max-w-prose">
                  {room.description}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {images.map((src, i) => (
                  <figure key={i} className="m-0">
                    <div className="aspect-[3/2] w-full overflow-hidden border border-rule bg-paper-2">
                      <img
                        src={src || ROOM_FALLBACK}
                        alt={`Room ${room.roomNumber} — view ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <figcaption className="mt-2 font-mono text-2xs uppercase tracking-widest text-muted">
                      Room {room.roomNumber} · plate {i + 1} / {images.length}
                    </figcaption>
                  </figure>
                ))}
              </div>

              {room.facilities && room.facilities.length > 0 && (
                <div>
                  <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-3">
                    In the room
                  </p>
                  <p className="font-mono text-sm text-ink-soft leading-loose">
                    {room.facilities.join("   ·   ")}
                  </p>
                </div>
              )}
            </div>

            {/* Right — reservation panel */}
            <aside className="lg:sticky lg:top-20 self-start border border-rule bg-paper-2 p-6 flex flex-col gap-5">
              <div className="border-b border-rule pb-4">
                <p className="font-display text-3xl text-ink tabular">${room.pricePerNight}</p>
                <p className="font-mono text-2xs uppercase tracking-widest text-muted mt-1">
                  per night
                </p>
              </div>

              {room.reservedDates && room.reservedDates.length > 0 && (
                <div className="border-b border-rule pb-4">
                  <p className="font-mono text-2xs uppercase tracking-widest text-brass mb-2">
                    Unavailable
                  </p>
                  <ul className="flex flex-col gap-1 font-mono text-2xs text-ink-soft">
                    {room.reservedDates.map((res: any, idx: number) => (
                      <li key={idx} className="tabular">
                        {new Date(res.checkInDate).toLocaleDateString("en-GB")} –{" "}
                        {new Date(res.checkOutDate).toLocaleDateString("en-GB")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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
                  className={field}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Departure</span>
                <input
                  type="date"
                  min={checkIn || todayStr}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={field}
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-2xs uppercase tracking-widest text-muted">Guests</span>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className={field}
                >
                  {Array.from({ length: room.maxGuests }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>

              {costBreakdown && (
                <div className="border-t border-rule pt-4 font-mono text-sm">
                  <div className="flex justify-between text-muted text-2xs uppercase tracking-widest">
                    <span>
                      ${room.pricePerNight} × <span className="tabular">{costBreakdown.nights}</span> night(s)
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-2">
                    <span className="font-sans text-2xs uppercase tracking-widest text-muted">Total</span>
                    <span className="font-display text-2xl text-ink tabular">${costBreakdown.total}</span>
                  </div>
                </div>
              )}

              {isConflict && (
                <p className="font-mono text-2xs uppercase tracking-widest text-stop leading-relaxed">
                  Room is booked for those dates. Pick another range.
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isConflict}
                onClick={handleProceedBooking}
              >
                {isConflict ? "Dates unavailable" : "Proceed to booking"}
              </Button>

              <p className="font-mono text-2xs uppercase tracking-widest text-muted text-center">
                Instant confirmation · double-booking protected
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
