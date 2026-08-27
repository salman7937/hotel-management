"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setCredentials } from "../../store/slices/authSlice";
import { loginApi } from "../../api/authApi";
import { Button } from "../../components/common/Button";

const field =
  "w-full bg-transparent text-ink border-0 border-b border-rule py-2 text-base " +
  "focus:outline-none focus:border-b-2 focus:border-pine transition-colors";
const labelCls = "font-mono text-2xs uppercase tracking-widest text-muted";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === "staff") {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please provide both staff email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await loginApi({ email, password });
      if (response.success && response.data) {
        const userRole = response.data.user?.role;
        if (userRole !== "staff") {
          setErrorMsg("Access denied. Only staff accounts can enter the portal.");
          return;
        }
        dispatch(
          setCredentials({
            user: response.data.user,
            token: response.data.accessToken,
          })
        );
        router.push("/admin/dashboard");
      } else {
        setErrorMsg(response.message || "Invalid credentials.");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Login failed. Please check staff credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col">
      <div className="max-w-5xl w-full mx-auto px-4 py-6">
        <Link
          href="/"
          className="font-mono text-2xs uppercase tracking-widest text-muted hover:text-pine transition-colors"
        >
          ← Guest site
        </Link>
      </div>

      <main className="flex-1 flex items-center px-4 py-12">
        <div className="w-full max-w-sm mx-auto">
          <p className="font-mono text-2xs uppercase tracking-[0.2em] text-brass mb-4">
            Staff &amp; Admin — Protected
          </p>
          <h1 className="font-display font-medium text-4xl leading-[0.98] text-ink">
            Management sign in.
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            Authorized staff credentials only.
          </p>

          {errorMsg && (
            <p className="mt-6 border-l-2 border-stop pl-4 py-2 font-mono text-2xs uppercase tracking-widest text-stop leading-relaxed">
              {errorMsg}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Staff email</span>
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
              {loading ? "Authenticating…" : "Sign in to portal"}
            </Button>
          </form>

          <p className="mt-6 pt-5 border-t border-rule font-mono text-2xs uppercase tracking-widest text-muted">
            GrandStay Management System v1.0
          </p>
        </div>
      </main>

      <footer className="py-6 text-center font-mono text-2xs uppercase tracking-widest text-muted">
        © {new Date().getFullYear()} GrandStay Hotels
      </footer>
    </div>
  );
}
