"use client";

import React, { useEffect, useState } from "react";
import { AdminSidebar } from "../components/AdminSidebar";
import { RoleGuard } from "../components/RoleGuard";
import { Badge } from "../../components/common/Badge";
import { Button } from "../../components/common/Button";
import {
  getRoomsApi,
  createRoomApi,
  updateRoomApi,
  deleteRoomApi,
  uploadRoomImageApi,
  RoomPayload,
} from "../../api/roomApi";
import { RoomData } from "../../store/slices/roomsSlice";
import {
  Plus,
  Edit2,
  Trash2,
  BedDouble,
  Users,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Sparkles,
  UploadCloud,
  Loader2,
} from "lucide-react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [roomType, setRoomType] = useState<"Standard" | "Deluxe" | "Executive" | "Family" | "Suite">("Standard");
  const [description, setDescription] = useState<string>("");
  const [pricePerNight, setPricePerNight] = useState<number>(100);
  const [maxGuests, setMaxGuests] = useState<number>(2);
  const [bedType, setBedType] = useState<string>("King Bed");
  const [facilities, setFacilities] = useState<string>("WiFi, AC, TV, Coffee Maker");
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRoomsApi({});
      if (response.success && Array.isArray(response.data)) {
        setRooms(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRoomId(null);
    setRoomNumber("");
    setRoomType("Standard");
    setDescription("");
    setPricePerNight(120);
    setMaxGuests(2);
    setBedType("King Bed");
    setFacilities("WiFi, AC, TV, Coffee Maker");
    setImages([]);
    setIsAvailable(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (room: RoomData) => {
    setEditingRoomId(room._id);
    setRoomNumber(room.roomNumber);
    setRoomType(room.roomType);
    setDescription(room.description);
    setPricePerNight(room.pricePerNight);
    setMaxGuests(room.maxGuests);
    setBedType(room.bedType);
    setFacilities(room.facilities.join(", "));
    setImages(room.images || []);
    setIsAvailable(room.isAvailable);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!roomNumber || !description || pricePerNight <= 0) {
      setFormError("Please fill in all required room details.");
      return;
    }

    const facilitiesArray = facilities
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const payload: RoomPayload = {
      roomNumber,
      roomType,
      description,
      pricePerNight: Number(pricePerNight),
      maxGuests: Number(maxGuests),
      bedType,
      facilities: facilitiesArray,
      images,
      isAvailable,
    };

    setSubmitting(true);
    try {
      if (editingRoomId) {
        await updateRoomApi(editingRoomId, payload);
      } else {
        await createRoomApi(payload);
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to save room.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFormError(null);
    try {
      const response = await uploadRoomImageApi(file);
      if (response.success && response.data?.url) {
        setImages((prev) => [...prev, response.data.url]);
      } else {
        setFormError(response.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteRoom = async (roomId: string, number: string) => {
    if (!confirm(`Are you sure you want to delete Room '${number}'?`)) return;
    try {
      await deleteRoomApi(roomId);
      fetchRooms();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete room.");
    }
  };

  return (
    <RoleGuard allowedRoles={["staff"]}>
      <div className="min-h-screen bg-slate-950 flex text-slate-100">
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-white font-outfit">Rooms Management</h1>
              <p className="text-slate-400 text-sm">Add, edit, or deactivate hotel room inventory.</p>
            </div>

            <Button variant="gold" size="md" onClick={handleOpenCreateModal} className="flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add New Room
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">Loading room inventory...</p>
            </div>
          ) : error ? (
            <div className="glass-panel p-8 rounded-2xl border border-rose-900/50 text-center">
              <p className="text-rose-400 font-semibold mb-2">{error}</p>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900 uppercase text-[11px] font-bold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Room #</th>
                      <th className="py-3.5 px-4">Type & Bed</th>
                      <th className="py-3.5 px-4">Max Guests</th>
                      <th className="py-3.5 px-4">Price / Night</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {rooms.map((room) => (
                      <tr key={room._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white">
                          <span className="text-amber-400">Room {room.roomNumber}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200">{room.roomType}</p>
                          <p className="text-xs text-slate-500">{room.bedType}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{room.maxGuests} Guests</td>
                        <td className="py-3.5 px-4 font-extrabold text-white">${room.pricePerNight}</td>
                        <td className="py-3.5 px-4">
                          {room.currentStatus === "Occupied" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Occupied (Checked-In)
                            </span>
                          ) : (room.currentStatus === "Reserved" || (room.reservedDates && room.reservedDates.length > 0)) ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                                <AlertCircle className="w-3.5 h-3.5" /> Reserved
                              </span>
                              {room.reservedDates && room.reservedDates[0] && (
                                <p className="text-[11px] text-amber-400/90 mt-1 font-medium">
                                  📅 {new Date(room.reservedDates[0].checkInDate).toLocaleDateString()} – {new Date(room.reservedDates[0].checkOutDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          ) : !room.isAvailable || room.currentStatus === "Maintenance" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700 font-bold">
                              <XCircle className="w-3.5 h-3.5" /> Maintenance
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Available
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(room)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                            title="Edit Room"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room._id, room.roomNumber)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Room"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Create / Edit Room Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white font-outfit">
                    {editingRoomId ? "Edit Room Details" : "Add New Room"}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Room # *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 101"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Room Type *</label>
                      <select
                        value={roomType}
                        onChange={(e) => setRoomType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Standard">Standard</option>
                        <option value="Deluxe">Deluxe</option>
                        <option value="Executive">Executive</option>
                        <option value="Family">Family</option>
                        <option value="Suite">Suite</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Price / Night ($) *</label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={pricePerNight}
                        onChange={(e) => setPricePerNight(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Max Guests *</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={maxGuests}
                        onChange={(e) => setMaxGuests(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Bed Type</label>
                    <input
                      type="text"
                      placeholder="e.g. King Bed"
                      value={bedType}
                      onChange={(e) => setBedType(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Room description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Facilities (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="WiFi, AC, TV, Coffee Maker"
                      value={facilities}
                      onChange={(e) => setFacilities(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">Room Images</label>

                    {images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {images.map((url, index) => (
                          <div key={url} className="relative group">
                            <img
                              src={url}
                              alt={`Room image ${index + 1}`}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-2 w-full bg-slate-900 border border-dashed border-slate-700 rounded-xl px-3.5 py-4 text-sm text-slate-400 hover:border-amber-500 hover:text-amber-400 cursor-pointer transition-colors">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4" /> Upload Image
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isAvailableCheck"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="w-4 h-4 text-amber-500 bg-slate-900 border-slate-800 rounded"
                    />
                    <label htmlFor="isAvailableCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                      Room is active and available for booking
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-800">
                    <Button variant="outline" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="gold" type="submit" className="flex-1 font-bold" disabled={submitting}>
                      {submitting ? "Saving..." : editingRoomId ? "Update Room" : "Create Room"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </RoleGuard>
  );
}
