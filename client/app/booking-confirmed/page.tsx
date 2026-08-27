"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { getBookingBySessionApi } from "../api/paymentApi";

const MAX_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 2000;

export default function BookingConfirmedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <p className="font-mono text-2xs uppercase tracking-widest text-muted">Loading…</p>
        </div>
      }
    >
      <BookingConfirmedContent />
    </Suspense>
  );
}

function BookingConfirmedContent() {
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
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {status === "waiting" && (
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass">
              Payment received
            </p>
            <h1 className="mt-2 font-display font-medium text-4xl leading-[0.98] text-ink">
              Confirming your reservation…
            </h1>
            <p className="mt-4 text-sm text-ink-soft leading-relaxed">
              Hold on while we finalise the booking with the front desk. This page will move
              you along automatically.
            </p>
          </div>
        )}

        {status === "timeout" && (
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass">
              Almost there
            </p>
            <h1 className="mt-2 font-display font-medium text-4xl leading-[0.98] text-ink">
              Your payment went through.
            </h1>
            <p className="mt-4 text-sm text-ink-soft leading-relaxed">
              Confirmation is taking a little longer than usual. Your reservation will appear
              under My Bookings once it&rsquo;s processed.
            </p>
            <Link href="/my-bookings" className="inline-block mt-6">
              <Button variant="primary" size="sm">Go to my bookings</Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-stop">
              Couldn&rsquo;t verify
            </p>
            <h1 className="mt-2 font-display font-medium text-4xl leading-[0.98] text-ink">
              Something went wrong.
            </h1>
            <p className="mt-4 text-sm text-ink-soft leading-relaxed">
              We couldn&rsquo;t verify this payment session. If you were charged, check My
              Bookings or contact the front desk.
            </p>
            <Link href="/rooms" className="inline-block mt-6">
              <Button variant="secondary" size="sm">Back to rooms</Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
