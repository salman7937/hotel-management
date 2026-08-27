"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { logoutApi } from "../../api/authApi";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore — clear the local session regardless
    }
    dispatch(logout());
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/rooms" },
    { name: "My Bookings", href: "/my-bookings" },
  ];

  const isAdmin = user?.role === "staff";

  const linkClass = (href: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `text-sm pb-0.5 border-b transition-colors ${
      active
        ? "text-pine border-pine"
        : "text-ink-soft border-transparent hover:text-ink"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-paper border-b border-rule">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <Link
            href="/"
            className="font-display text-xl tracking-tight text-ink hover:text-pine transition-colors"
          >
            GrandStay
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={linkClass(link.href)}>
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin/dashboard" className={linkClass("/admin")}>
                Admin
              </Link>
            )}
          </div>

          {/* Auth state */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <span className="w-24 h-4 bg-paper-2 border border-rule" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3 font-mono text-2xs uppercase tracking-widest">
                <span className="text-ink-soft">
                  {user.name} <span className="text-muted">· {user.role}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-muted hover:text-stop transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 font-mono text-2xs uppercase tracking-widest">
                <Link href="/login" className="text-ink-soft hover:text-pine transition-colors">
                  Log in
                </Link>
                <Link href="/admin/login" className="text-muted hover:text-pine transition-colors">
                  Staff
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-ink-soft hover:text-ink"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-t border-rule px-4 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-ink-soft"
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base text-pine"
            >
              Admin
            </Link>
          )}
          <div className="pt-4 border-t border-rule font-mono text-2xs uppercase tracking-widest">
            {isAuthenticated && user ? (
              <button onClick={handleLogout} className="text-stop">
                Sign out — {user.name}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-pine">
                  Log in / Register
                </Link>
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="text-muted">
                  Staff sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
