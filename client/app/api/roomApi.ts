import axiosInstance from "./axiosInstance";

export interface RoomFilterParams {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  isAvailable?: boolean;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface RoomPayload {
  roomNumber: string;
  roomType: "Standard" | "Deluxe" | "Executive" | "Family" | "Suite";
  description: string;
  pricePerNight: number;
  maxGuests: number;
  bedType: string;
  facilities: string[];
  images: string[];
  isAvailable?: boolean;
}

export const getRoomsApi = async (params: RoomFilterParams = {}) => {
  const response = await axiosInstance.get("/rooms", { params });
  return response.data;
};

export const getRoomByIdApi = async (id: string) => {
  const response = await axiosInstance.get(`/rooms/${id}`);
  return response.data;
};

export const createRoomApi = async (data: RoomPayload) => {
  const response = await axiosInstance.post("/rooms", data);
  return response.data;
};

export const updateRoomApi = async (id: string, data: Partial<RoomPayload>) => {
  const response = await axiosInstance.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoomApi = async (id: string) => {
  const response = await axiosInstance.delete(`/rooms/${id}`);
  return response.data;
};

export const uploadRoomImageApi = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axiosInstance.post("/rooms/upload-image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
