import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoomData {
  _id: string;
  roomNumber: string;
  roomType: "Standard" | "Deluxe" | "Executive" | "Family" | "Suite";
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  facilities: string[];
  images: string[];
  isAvailable: boolean;
  currentStatus?: "Available" | "Reserved" | "Occupied" | "Maintenance";
  reservedDates?: { checkInDate: string; checkOutDate: string; status: string }[];
}

export interface RoomFilters {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  checkInDate?: string;
  checkOutDate?: string;
}

interface RoomsState {
  rooms: RoomData[];
  selectedRoom: RoomData | null;
  filters: RoomFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: RoomsState = {
  rooms: [],
  selectedRoom: null,
  filters: {},
  isLoading: false,
  error: null,
};

export const roomsSlice = createSlice({
  name: "rooms",
  initialState,
  reducers: {
    setRooms: (state, action: PayloadAction<RoomData[]>) => {
      state.rooms = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSelectedRoom: (state, action: PayloadAction<RoomData | null>) => {
      state.selectedRoom = action.payload;
      state.isLoading = false;
    },
    setFilters: (state, action: PayloadAction<RoomFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {};
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setRooms,
  setSelectedRoom,
  setFilters,
  resetFilters,
  setLoading,
  setError,
} = roomsSlice.actions;

export default roomsSlice.reducer;
