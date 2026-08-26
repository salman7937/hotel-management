import axiosInstance from "./axiosInstance";

export const getDashboardStatsApi = async () => {
  const response = await axiosInstance.get("/dashboard/stats");
  return response.data;
};
