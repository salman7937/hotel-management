import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RoomData } from "./roomsSlice";

export interface ReservationData {
  _id: string;
  bookingId: string;
  guestName: string;
  email: string;
  phone: string;
  room: RoomData | string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  totalAmount: number;
  status: "Pending" | "Confirmed" | "Checked-in" | "Checked-out" | "Cancelled";
  paymentMethod: "online" | "cash";
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
}

interface ReservationsState {
  myBookings: ReservationData[];
  activeReservation: ReservationData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ReservationsState = {
  myBookings: [],
  activeReservation: null,
  isLoading: false,
  error: null,
};

export const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setMyBookings: (state, action: PayloadAction<ReservationData[]>) => {
      state.myBookings = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setActiveReservation: (state, action: PayloadAction<ReservationData | null>) => {
      state.activeReservation = action.payload;
      state.isLoading = false;
    },
    addBooking: (state, action: PayloadAction<ReservationData>) => {
      state.myBookings.unshift(action.payload);
      state.activeReservation = action.payload;
      state.isLoading = false;
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
  setMyBookings,
  setActiveReservation,
  addBooking,
  setLoading,
  setError,
} = reservationsSlice.actions;

export default reservationsSlice.reducer;
