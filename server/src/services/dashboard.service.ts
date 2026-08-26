import { Room } from "../models/Room.model.js";
import { Reservation } from "../models/Reservation.model.js";

export const getDashboardStats = async () => {
  const [
    totalRooms,
    availableRooms,
    totalReservations,
    activeBookings,
    checkedInRooms,
    revenueResult,
    recentReservations,
  ] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ isAvailable: true }),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: { $in: ["Pending", "Confirmed", "Checked-in"] } }),
    Reservation.countDocuments({ status: "Checked-in" }),
    Reservation.aggregate([
      { $match: { status: { $in: ["Confirmed", "Checked-in", "Checked-out"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),
    Reservation.find()
      .populate("room", "roomNumber roomType pricePerNight")
      .populate("guest", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;
  const occupancyRate = totalRooms > 0 ? Math.round((checkedInRooms / totalRooms) * 100) : 0;

  return {
    totalRooms,
    availableRooms,
    totalReservations,
    activeBookings,
    checkedInRooms,
    totalRevenue,
    occupancyRate,
    recentReservations,
  };
};
