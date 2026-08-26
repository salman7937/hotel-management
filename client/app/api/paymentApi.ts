import axiosInstance from "./axiosInstance";

export interface OnlineBookingCheckoutPayload {
  guestName: string;
  email: string;
  phone: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
}

export const createOnlineBookingCheckoutApi = async (data: OnlineBookingCheckoutPayload) => {
  const response = await axiosInstance.post("/payments/create-checkout-session", data);
  return response.data;
};

export const getBookingBySessionApi = async (sessionId: string) => {
  const response = await axiosInstance.get(`/payments/session/${sessionId}`);
  return response.data;
};
