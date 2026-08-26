import axiosInstance from "./axiosInstance";

export interface RegisterPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export const loginApi = async (data: LoginPayload) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const registerApi = async (data: RegisterPayload) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const getMeApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};
