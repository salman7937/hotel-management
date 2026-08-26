"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { logoutApi } from "../../api/authApi";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Hotel,
  LogOut,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      // Ignore — proceed to clear local session regardless
    }
    dispatch(logout());
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Dashboard Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Rooms Management", href: "/admin/rooms", icon: BedDouble },
    { name: "Reservations", href: "/admin/reservations", icon: CalendarCheck },
    { name: "Guests", href: "/admin/guests", icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-screen sticky top-0">
      <div className="p-6 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-600/30">
            <Hotel className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white font-outfit">GrandStay</h2>
            <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Admin Portal
            </span>
          </div>
        </div>

        {/* Admin User Info */}
        {user && (
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-amber-400 uppercase font-semibold">{user.role}</p>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-800 space-y-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>
    </aside>
  );
};
