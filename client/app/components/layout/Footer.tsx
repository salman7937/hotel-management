"use client";

import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-paper border-t border-rule text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <Link href="/" className="font-display text-lg text-ink">
              GrandStay
            </Link>
            <p className="text-sm leading-relaxed text-ink-soft max-w-xs">
              Grand luxury, immaculate rooms, and a booking desk that never closes.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-muted mb-4">
              Navigate
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              <li><Link href="/" className="hover:text-pine transition-colors">Home</Link></li>
              <li><Link href="/rooms" className="hover:text-pine transition-colors">Rooms</Link></li>
              <li><Link href="/my-bookings" className="hover:text-pine transition-colors">My Bookings</Link></li>
              <li><Link href="/admin/login" className="hover:text-pine transition-colors">Staff Sign In</Link></li>
            </ul>
          </div>

          {/* Accommodation */}
          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-muted mb-4">
              Accommodation
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              <li>Standard</li>
              <li>Deluxe</li>
              <li>Executive</li>
              <li>Family</li>
              <li>Presidential Suite</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-mono text-2xs uppercase tracking-widest text-muted mb-4">
              Reception
            </h4>
            <ul className="flex flex-col gap-2 text-sm text-ink-soft">
              <li>102 Grandstay Avenue</li>
              <li>Hospitality City</li>
              <li className="tabular">+1 (800) 555 47263</li>
              <li>reservations@grandstayhotels.com</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-10 border-t border-rule flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-2xs uppercase tracking-widest text-muted">
          <p>© {new Date().getFullYear()} GrandStay Hotels</p>
          <p>Est. 1926 — Hospitality City</p>
        </div>
      </div>
    </footer>
  );
};
