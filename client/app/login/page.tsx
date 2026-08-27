"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { loginApi } from "../api/authApi";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";
const labelCls = "font-mono text-2xs uppercase tracking-widest text-muted";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [staffRedirect, setStaffRedirect] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(user.role === "staff" ? "/admin/dashboard" : "/rooms");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setStaffRedirect(false);

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      if (response.success && response.data) {
        if (response.data.user?.role === "staff") {
          setErrorMsg("This is a staff account. Please sign in through the Admin Portal.");
          setStaffRedirect(true);
          return;
        }
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
          })
        );
        router.push("/rooms");
      } else {
        setErrorMsg(response.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />

      <main className="flex-1 flex items-center py-16 px-4">
        <div className="w-full max-w-sm mx-auto">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-4">
            Guest Account
          </p>
          <h1 className="font-display font-medium text-4xl leading-[0.98] text-ink">
            Welcome back.
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Sign in to manage your bookings.
          </p>

          {errorMsg && (
            <div className="mt-6 border-l-2 border-stop pl-4 py-2 flex flex-col gap-2">
              <p className="font-mono text-2xs uppercase tracking-widest text-stop leading-relaxed">
                {errorMsg}
              </p>
              {staffRedirect && (
                <Link
                  href="/admin/login"
                  className="font-mono text-2xs uppercase tracking-widest text-pine border-b border-pine self-start pb-0.5"
                >
                  Go to Admin Portal
                </Link>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </label>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>

          <p className="mt-6 pt-5 border-t border-rule font-mono text-2xs uppercase tracking-widest text-muted">
            No account?{" "}
            <Link href="/register" className="text-pine border-b border-pine pb-0.5">
              Create one
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
