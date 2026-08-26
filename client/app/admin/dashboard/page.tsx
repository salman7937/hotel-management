"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminSidebar } from "../components/AdminSidebar";
import { RoleGuard } from "../components/RoleGuard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { getDashboardStatsApi } from "../../api/dashboardApi";
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStatsApi();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "success";
      case "Checked-in":
        return "gold";
      case "Checked-out":
        return "default";
      case "Cancelled":
        return "danger";
      case "Pending":
      default:
        return "warning";
    }
  };

  return (
    <RoleGuard>
      <div className="min-h-screen bg-slate-950 flex text-slate-100">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white font-outfit">Dashboard Overview</h1>
              <p className="text-slate-400 text-sm">Real-time occupancy, revenue, and active bookings performance.</p>
            </div>

            <Button variant="outline" size="sm" onClick={fetchStats} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh Stats
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Calculating real-time hotel metrics...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center">
              <p className="text-rose-400 font-semibold mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchStats}>
                Retry
              </Button>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Metrics Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Revenue</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white font-outfit">${stats.totalRevenue}</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" /> From confirmed & checked-out stays
                  </p>
                </div>

                {/* Occupancy Rate */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Occupancy Rate</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-amber-400 font-outfit">{stats.occupancyRate}%</p>
                  <p className="text-[11px] text-slate-400">
                    {stats.checkedInRooms} of {stats.totalRooms} rooms currently checked-in
                  </p>
                </div>

                {/* Active Bookings */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Active Bookings</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                      <CalendarCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white font-outfit">{stats.activeBookings}</p>
                  <p className="text-[11px] text-slate-400">
                    {stats.totalReservations} total reservations recorded
                  </p>
                </div>

                {/* Total Rooms */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Available Rooms</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <BedDouble className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold text-white font-outfit">
                    {stats.availableRooms} <span className="text-base text-slate-400">/ {stats.totalRooms}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Ready for guest reservations</p>
                </div>
              </div>

              {/* Recent Reservations Table */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white font-outfit">Recent Bookings Activity</h3>
                    <p className="text-xs text-slate-400">Latest reservation requests and status overview.</p>
                  </div>
                  <Link href="/admin/reservations">
                    <Button variant="ghost" size="sm" className="text-amber-400 text-xs flex items-center gap-1">
                      Manage All Bookings <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/80 uppercase text-[11px] font-bold text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Booking ID</th>
                        <th className="py-3 px-4">Guest Name</th>
                        <th className="py-3 px-4">Room</th>
                        <th className="py-3 px-4">Check-in / Check-out</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {stats.recentReservations?.map((res: any) => (
                        <tr key={res._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">#{res.bookingId}</td>
                          <td className="py-3.5 px-4">
                            <div>
                              <p className="font-semibold text-slate-200">{res.guestName}</p>
                              <p className="text-xs text-slate-500">{res.email}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-amber-400">
                            {res.room ? `Room ${res.room.roomNumber} (${res.room.roomType})` : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {new Date(res.checkInDate).toLocaleDateString()} ➔{" "}
                            {new Date(res.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">${res.totalAmount}</td>
                          <td className="py-3.5 px-4">
                            <Badge variant={getBadgeVariant(res.status)} size="sm">
                              {res.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </RoleGuard>
  );
}
