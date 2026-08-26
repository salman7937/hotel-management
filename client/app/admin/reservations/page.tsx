"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import { RoleGuard } from "../components/RoleGuard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  getAllReservationsApi,
  updateReservationStatusApi,
} from "../../api/reservationApi";
import { ReservationData } from "../../store/slices/reservationsSlice";
import {
  Search,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  CalendarCheck,
  RefreshCw,
  Info,
  Eye,
  X,
  Mail,
  Phone,
  MessageSquare,
  DollarSign,
} from "lucide-react";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewingReservation, setViewingReservation] = useState<ReservationData | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await getAllReservationsApi(params);
      if (response.success && Array.isArray(response.data)) {
        setReservations(response.data);
      } else {
        setReservations([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const response = await updateReservationStatusApi(id, newStatus);
      if (response.success) {
        fetchReservations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to update status to '${newStatus}'.`);
    } finally {
      setUpdatingId(null);
    }
  };

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

  const tabs = [
    { label: "All Reservations", value: "" },
    { label: "Pending", value: "Pending" },
    { label: "Confirmed", value: "Confirmed" },
    { label: "Checked-in", value: "Checked-in" },
    { label: "Checked-out", value: "Checked-out" },
    { label: "Cancelled", value: "Cancelled" },
  ];

  return (
    <RoleGuard allowedRoles={["staff"]}>
      <div className="min-h-screen bg-slate-950 flex text-slate-100">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white font-outfit">Reservations Management</h1>
              <p className="text-slate-400 text-sm">Monitor guest bookings and perform status updates.</p>
            </div>

            <Button variant="outline" size="sm" onClick={fetchReservations} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh Table
            </Button>
          </div>

          {/* Search & Filter Tabs */}
          <div className="space-y-4 mb-6">
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by Booking ID, Guest Name, Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === tab.value
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading reservations...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center">
              <p className="text-rose-400 font-semibold mb-2">{error}</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center">
              <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Reservations Found</h3>
              <p className="text-slate-400 text-xs">Try clearing search query or selecting a different status tab.</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 uppercase text-[11px] font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Booking ID</th>
                      <th className="py-3.5 px-4">Guest Details</th>
                      <th className="py-3.5 px-4">Room</th>
                      <th className="py-3.5 px-4">Dates</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Payment</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reservations.map((res) => {
                      const roomObj = typeof res.room === "object" ? res.room : null;
                      const isUpdating = updatingId === res._id;
                      return (
                        <tr key={res._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white">#{res.bookingId}</td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-200">{res.guestName}</p>
                            <p className="text-xs text-slate-500">{res.email} • {res.phone}</p>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-amber-400">
                            {roomObj ? `Room ${roomObj.roomNumber} (${roomObj.roomType})` : "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400">
                            {new Date(res.checkInDate).toLocaleDateString()} ➔{" "}
                            {new Date(res.checkOutDate).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-extrabold text-white">${res.totalAmount}</td>
                          <td className="py-3.5 px-4 text-xs">
                            <p className="text-slate-300 font-medium">
                              {res.paymentMethod === "online" ? "Online" : "Cash"}
                            </p>
                            <p className={res.paymentStatus === "paid" ? "text-emerald-400" : "text-amber-400"}>
                              {res.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={getBadgeVariant(res.status)} size="sm">
                              {res.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1">
                            <button
                              onClick={() => setViewingReservation(res)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                            {res.status === "Pending" && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(res._id, "Confirmed")}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
                                >
                                  Confirm
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(res._id, "Cancelled")}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {res.status === "Confirmed" && (
                              <>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(res._id, "Checked-in")}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                >
                                  Check-in
                                </button>
                                <button
                                  disabled={isUpdating}
                                  onClick={() => handleStatusUpdate(res._id, "Cancelled")}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {res.status === "Checked-in" && (
                              <button
                                disabled={isUpdating}
                                onClick={() => handleStatusUpdate(res._id, "Checked-out")}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                              >
                                Check-out
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {viewingReservation && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setViewingReservation(null)}
          >
            <div
              className="glass-panel bg-slate-900 max-w-lg w-full p-7 rounded-3xl border border-slate-800 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-white font-outfit">
                    #{viewingReservation.bookingId}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Created {new Date(viewingReservation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingReservation(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(viewingReservation.status)} size="sm">
                  {viewingReservation.status}
                </Badge>
                <Badge variant={viewingReservation.paymentStatus === "paid" ? "success" : "warning"} size="sm">
                  {viewingReservation.paymentMethod === "online" ? "Online" : "Cash"} ·{" "}
                  {viewingReservation.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Guest</p>
                  <p className="text-slate-200 font-semibold">{viewingReservation.guestName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Total
                  </p>
                  <p className="text-amber-400 font-extrabold">${viewingReservation.totalAmount}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-slate-200">{viewingReservation.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <p className="text-slate-200">{viewingReservation.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Check-in</p>
                  <p className="text-slate-200">
                    {new Date(viewingReservation.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Check-out</p>
                  <p className="text-slate-200">
                    {new Date(viewingReservation.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Guests</p>
                  <p className="text-slate-200">{viewingReservation.numberOfGuests}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500">Room</p>
                  <p className="text-slate-200">
                    {typeof viewingReservation.room === "object"
                      ? `${viewingReservation.room.roomType} (${viewingReservation.room.roomNumber})`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {viewingReservation.specialRequests && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <p className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1 mb-1">
                    <MessageSquare className="w-3 h-3" /> Special Requests
                  </p>
                  <p className="text-slate-300 text-sm">{viewingReservation.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
