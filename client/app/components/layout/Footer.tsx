"use client";

import React from "react";
import Link from "next/link";
import { Hotel, Phone, Mail, MapPin, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-950 border-t border-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-slate-950">
                <Hotel className="w-6 h-6 font-bold" />
              </div>
              <span className="text-lg font-bold text-white font-outfit">
                GrandStay <span className="text-amber-500">Hotels</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Experience grand luxury, immaculate rooms, world-class amenities, and seamless online booking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-amber-400 transition-colors">
                  Browse Rooms
                </Link>
              </li>
              <li>
                <Link href="/my-bookings" className="hover:text-amber-400 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-amber-400 transition-colors">
                  Staff / Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Room Types */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Accommodation</h4>
            <ul className="space-y-2 text-xs">
              <li>Standard Room</li>
              <li>Deluxe Room</li>
              <li>Executive Room</li>
              <li>Family Suite</li>
              <li>Presidential Suite</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">Get in Touch</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>102 Grandstay Avenue, Hospitality City</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>+1 (800) 555-GRAND</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>reservations@grandstayhotels.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-900/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} GrandStay Hotels. All rights reserved. DevtaSoft Architecture.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for GrandStay Client Brief
          </p>
        </div>
      </div>
    </footer>
  );
};
