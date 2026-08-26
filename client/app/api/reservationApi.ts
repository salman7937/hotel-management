import axiosInstance from "./axiosInstance";

export interface CreateReservationPayload {
  guestName: string;
  email: string;
  phone: string;
  room: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  specialRequests?: string;
  paymentMethod: "online" | "cash";
}

export const createReservationApi = async (data: CreateReservationPayload) => {
  const response = await axiosInstance.post("/reservations", data);
  return response.data;
};

export const getMyBookingsApi = async () => {
  const response = await axiosInstance.get("/reservations/my");
  return response.data;
};

export const getAllReservationsApi = async (params: { status?: string; search?: string } = {}) => {
  const response = await axiosInstance.get("/reservations", { params });
  return response.data;
};

export const getAllGuestsApi = async (params: { search?: string } = {}) => {
  const response = await axiosInstance.get("/reservations/guests", { params });
  return response.data;
};

export const getReservationByIdApi = async (id: string) => {
  const response = await axiosInstance.get(`/reservations/${id}`);
  return response.data;
};

export const updateReservationStatusApi = async (id: string, status: string) => {
  const response = await axiosInstance.patch(`/reservations/${id}/status`, { status });
  return response.data;
};
