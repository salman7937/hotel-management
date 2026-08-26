"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { getBookingBySessionApi } from "../api/paymentApi";
import { AlertCircle, Loader2 } from "lucide-react";

const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export default function BookingConfirmedPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get("session_id");

  const [status, setStatus] = useState<"waiting" | "timeout" | "error">("waiting");
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const response = await getBookingBySessionApi(sessionId);
        if (cancelled) return;

        if (response.success && response.data?._id) {
          router.replace(`/my-bookings/${response.data._id}?payment=success`);
          return;
        }
      } catch {
        // Keep polling — webhook may not have fired yet
      }

      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        if (!cancelled) setStatus("timeout");
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId, router]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        {status === "waiting" && (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-4 w-full">
            <Loader2 className="w-12 h-12 text-amber-400 mx-auto animate-spin" />
            <h2 className="text-xl font-bold text-white">Confirming your payment...</h2>
            <p className="text-slate-400 text-sm">
              Please wait while we finalize your reservation with GrandStay Hotels.
            </p>
          </div>
        )}

        {status === "timeout" && (
          <div className="glass-panel p-10 rounded-3xl border border-amber-500/30 text-center space-y-4 w-full">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Almost there...</h2>
            <p className="text-slate-400 text-sm">
              Your payment was received, but confirmation is taking longer than expected. Check "My
              Bookings" in a moment — your reservation will appear there once processed.
            </p>
            <Link href="/my-bookings">
              <Button variant="gold" className="w-full">
                Go to My Bookings
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="glass-panel p-10 rounded-3xl border border-rose-900/50 text-center space-y-4 w-full">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
            <p className="text-slate-400 text-sm">
              We couldn't verify this payment session. If you were charged, please check "My Bookings" or
              contact support.
            </p>
            <Link href="/rooms">
              <Button variant="outline" className="w-full">
                Back to Rooms
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
