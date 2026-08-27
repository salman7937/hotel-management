import { Room, IRoom } from "../models/Room.model.js";
import { Reservation } from "../models/Reservation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { CreateRoomInput, UpdateRoomInput } from "../validators/room.validator.js";

export interface RoomQueryFilters {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  isAvailable?: boolean;
  checkInDate?: string;
  checkOutDate?: string;
}

export const getAllRooms = async (filters: RoomQueryFilters = {}) => {
  const query: any = {};

  if (filters.roomType) {
    query.roomType = filters.roomType;
  }

  if (filters.isAvailable !== undefined) {
    query.isAvailable = filters.isAvailable;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.pricePerNight = {};
    if (filters.minPrice !== undefined) query.pricePerNight.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) query.pricePerNight.$lte = filters.maxPrice;
  }

  if (filters.guests) {
    query.maxGuests = { $gte: filters.guests };
  }

  let rooms = await Room.find(query).sort({ roomNumber: 1 });

  // If date search parameters are provided, filter out rooms booked in that date range
  if (filters.checkInDate && filters.checkOutDate) {
    const checkIn = new Date(filters.checkInDate);
    const checkOut = new Date(filters.checkOutDate);

    if (
      Number.isNaN(checkIn.getTime()) ||
      Number.isNaN(checkOut.getTime()) ||
      checkOut <= checkIn
    ) {
      throw new ApiError(400, "Invalid check-in / check-out date range.");
    }

    const conflictingReservations = await Reservation.find({
      status: { $ne: "Cancelled" },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn },
    }).select("room");

    const unavailableRoomIds = new Set(
      conflictingReservations.map((r) => r.room.toString())
    );

    rooms = rooms.filter((room) => !unavailableRoomIds.has(room._id.toString()));
  }

  // Calculate dynamic status and active bookings for each room
  const now = new Date();
  const activeReservations = await Reservation.find({
    status: { $in: ["Pending", "Confirmed", "Checked-in"] },
  }).select("room checkInDate checkOutDate status");

  const reservationMapByRoom = new Map<string, any[]>();
  activeReservations.forEach((res) => {
    const roomIdStr = res.room.toString();
    if (!reservationMapByRoom.has(roomIdStr)) {
      reservationMapByRoom.set(roomIdStr, []);
    }
    reservationMapByRoom.get(roomIdStr)!.push(res);
  });

  const processedRooms = rooms.map((roomDoc) => {
    const roomObj = roomDoc.toObject();
    const roomBookings = reservationMapByRoom.get(roomDoc._id.toString()) || [];

    const todayBooking = roomBookings.find((b) => {
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      return start <= now && now <= end;
    });

    let currentStatus: "Available" | "Reserved" | "Occupied" | "Maintenance" = "Available";
    if (todayBooking) {
      if (todayBooking.status === "Checked-in") {
        currentStatus = "Occupied";
      } else {
        currentStatus = "Reserved";
      }
    } else if (roomBookings.length > 0) {
      currentStatus = "Reserved";
    } else if (!roomDoc.isAvailable) {
      currentStatus = "Maintenance";
    }

    return {
      ...roomObj,
      currentStatus,
      reservedDates: roomBookings.map((b) => ({
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        status: b.status,
      })),
    };
  });

  return processedRooms;
};

export const getRoomById = async (roomId: string): Promise<any> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, `Room with ID ${roomId} not found.`);
  }

  const now = new Date();
  const activeReservations = await Reservation.find({
    room: roomId,
    status: { $in: ["Pending", "Confirmed", "Checked-in"] },
  }).select("checkInDate checkOutDate status");

  const todayBooking = activeReservations.find((b) => {
    const start = new Date(b.checkInDate);
    const end = new Date(b.checkOutDate);
    return start <= now && now <= end;
  });

  let currentStatus: "Available" | "Reserved" | "Occupied" | "Maintenance" = "Available";
  if (todayBooking) {
    if (todayBooking.status === "Checked-in") {
      currentStatus = "Occupied";
    } else {
      currentStatus = "Reserved";
    }
  } else if (activeReservations.length > 0) {
    currentStatus = "Reserved";
  } else if (!room.isAvailable) {
    currentStatus = "Maintenance";
  }

  return {
    ...room.toObject(),
    currentStatus,
    reservedDates: activeReservations.map((b) => ({
      checkInDate: b.checkInDate,
      checkOutDate: b.checkOutDate,
      status: b.status,
    })),
  };
};

export const createRoom = async (input: CreateRoomInput): Promise<IRoom> => {
  const existingRoom = await Room.findOne({ roomNumber: input.roomNumber.trim() });
  if (existingRoom) {
    throw new ApiError(409, `Room number '${input.roomNumber}' already exists.`);
  }

  const room = await Room.create(input);
  return room;
};

export const updateRoom = async (roomId: string, input: UpdateRoomInput): Promise<IRoom> => {
  if (input.roomNumber) {
    const existing = await Room.findOne({
      roomNumber: input.roomNumber.trim(),
      _id: { $ne: roomId },
    });
    if (existing) {
      throw new ApiError(409, `Room number '${input.roomNumber}' is already in use by another room.`);
    }
  }

  const room = await Room.findByIdAndUpdate(roomId, { $set: input }, { new: true, runValidators: true });
  if (!room) {
    throw new ApiError(404, `Room with ID ${roomId} not found.`);
  }
  return room;
};

export const deleteRoom = async (roomId: string): Promise<{ message: string }> => {
  const room = await Room.findById(roomId);
  if (!room) {
    throw new ApiError(404, `Room with ID ${roomId} not found.`);
  }

  const activeBookings = await Reservation.countDocuments({
    room: roomId,
    status: { $in: ["Pending", "Confirmed", "Checked-in"] },
  });

  if (activeBookings > 0) {
    throw new ApiError(
      400,
      `Cannot delete room '${room.roomNumber}' because it has ${activeBookings} active reservation(s).`
    );
  }

  await Room.findByIdAndDelete(roomId);
  return { message: `Room '${room.roomNumber}' deleted successfully.` };
};
