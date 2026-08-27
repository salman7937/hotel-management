"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/common/Button";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";
import { registerApi } from "../api/authApi";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";
const labelCls = "font-mono text-2xs uppercase tracking-widest text-muted";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(user.role === "staff" ? "/admin/dashboard" : "/rooms");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name || !email || !password) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const response = await registerApi({ name, email, phone, password });
      if (response.success && response.data) {
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
          })
        );
        router.push("/rooms");
      } else {
        setErrorMsg(response.message || "Registration failed.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "An error occurred during registration.");
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
            New Guest
          </p>
          <h1 className="font-display font-medium text-4xl leading-[0.98] text-ink">
            Create an account.
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            One account for every stay, and your bookings in one place.
          </p>

          {errorMsg && (
            <p className="mt-6 border-l-2 border-stop pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-stop leading-relaxed">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Full name *</span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Email *</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={field}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Password * <span className="text-muted">(min 6)</span></span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
              />
            </label>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 pt-5 border-t border-rule font-mono text-2xs uppercase tracking-widest text-muted">
            Have an account?{" "}
            <Link href="/login" className="text-pine border-b border-pine pb-0.5">
              Sign in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
