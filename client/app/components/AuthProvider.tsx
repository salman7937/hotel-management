"use client";

import { useEffect } from "react";
import axios from "axios";
import { useAppDispatch } from "../store/hooks";
import { getMeApi } from "../api/authApi";
import { setCredentials, logout, setLoading } from "../store/slices/authSlice";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      dispatch(setLoading(true));
      let token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      try {
        if (token) {
          const response = await getMeApi();
          if (response.success && response.data) {
            dispatch(
              setCredentials({
                user: response.data,
                token,
              })
            );
            return;
          }
        }
      } catch (err) {
        // Access token in localStorage failed or expired, proceed to cookie refresh
      }

      // Silent cookie refresh check (for tab closes or expired access tokens)
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", newAccessToken);
          }
          const meResponse = await getMeApi();
          if (meResponse.success && meResponse.data) {
            dispatch(
              setCredentials({
                user: meResponse.data,
                token: newAccessToken,
              })
            );
            return;
          }
        }
      } catch (refreshErr) {
        // No valid refresh token or user logged out
      }

      dispatch(logout());
    };

    initAuth();
  }, [dispatch]);

  return <>{children}</>;
}
