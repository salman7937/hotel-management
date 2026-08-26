"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hotel, User, LogOut, Menu, X, ShieldCheck, CalendarCheck, BedDouble } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { logoutApi } from "../../api/authApi";
import { Button } from "../common/Button";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Ignore — proceed to clear local session regardless
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: Hotel },
    { name: "Browse Rooms", href: "/rooms", icon: BedDouble },
    { name: "My Bookings", href: "/my-bookings", icon: CalendarCheck },
  ];

  const isAdmin = user?.role === "staff";

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-600/30 group-hover:scale-105 transition-transform duration-300">
              <Hotel className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white font-outfit">
                GrandStay <span className="gold-gradient-text">Hotels</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                Luxury & Comfort
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-600 text-white shadow-md shadow-amber-900/30"
                    : "text-amber-400 border border-amber-500/30 hover:bg-amber-500/10"
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          {/* User Profile / Auth Action */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-28 h-9 rounded-xl bg-slate-800/60 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-slate-200">{user.name}</span>
                  <span className="text-xs text-amber-400 capitalize font-medium">{user.role}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} title="Log Out">
                  <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-400" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" leftIcon={<User className="w-4 h-4" />}>
                    Log In
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="ghost" size="sm" className="text-slate-400 text-xs">
                    Admin Portal
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-slate-800"
              >
                <Icon className="w-5 h-5 text-amber-500" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span>Admin Portal</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between px-4 py-2">
                <div>
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-amber-400 capitalize">{user.role}</p>
                </div>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="gold" className="w-full">
                    Log In / Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
