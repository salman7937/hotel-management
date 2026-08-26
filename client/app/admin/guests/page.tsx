"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import { RoleGuard } from "../components/RoleGuard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import { getAllGuestsApi } from "../../api/reservationApi";
import { Search, RefreshCw, Info, Mail, Phone, BedDouble, DollarSign, UserCircle } from "lucide-react";

interface GuestRecord {
  _id: string;
  guestName: string;
  email: string;
  phone: string;
  totalBookings: number;
  totalSpent: number;
  lastBookingDate: string;
  statuses: string[];
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      const response = await getAllGuestsApi(params);
      if (response.success && Array.isArray(response.data)) {
        setGuests(response.data);
      } else {
        setGuests([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load guest directory.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  return (
    <RoleGuard allowedRoles={["staff"]}>
      <div className="min-h-screen bg-slate-950 flex text-slate-100">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white font-outfit">Guest Management</h1>
              <p className="text-slate-400 text-sm">
                Directory of guests derived from reservation history, with booking totals and spend.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={fetchGuests} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>

          <div className="relative max-w-md mb-6">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by guest name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading guests...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center">
              <p className="text-rose-400 font-semibold mb-2">{error}</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
              <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Guests Found</h3>
              <p className="text-slate-400 text-xs">Guests appear here once reservations are created.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 uppercase text-[11px] font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Guest</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Total Bookings</th>
                      <th className="py-3.5 px-4">Total Spent</th>
                      <th className="py-3.5 px-4">Last Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {guests.map((guest) => (
                      <tr key={guest._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 font-semibold text-slate-200">
                            <UserCircle className="w-5 h-5 text-amber-400" />
                            {guest.guestName}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400 space-y-1">
                          <p className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> {guest.email}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> {guest.phone}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant="gold" size="sm">
                            <BedDouble className="w-3 h-3 mr-1 inline" /> {guest.totalBookings}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-white">
                          <DollarSign className="w-3.5 h-3.5 inline text-amber-400" />
                          {guest.totalSpent}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {new Date(guest.lastBookingDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
