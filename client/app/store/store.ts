import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import roomsReducer from "./slices/roomsSlice";
import reservationsReducer from "./slices/reservationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rooms: roomsReducer,
    reservations: reservationsReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
