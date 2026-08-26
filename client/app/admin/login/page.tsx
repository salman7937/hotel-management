"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "../../store/hooks";
import { setCredentials } from "../../store/slices/authSlice";
import { loginApi } from "../../api/authApi";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { Mail, Lock, ShieldCheck, Hotel, AlertCircle, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          setErrorMsg("Access denied. Only Staff accounts can access the Portal.");
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      {/* Top Header */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-amber-400">
          <ArrowLeft className="w-4 h-4" /> Return to Guest Site
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-600/30">
              <ShieldCheck className="w-8 h-8 text-slate-950 font-bold" />
            </div>
            <Badge variant="gold" size="sm">
              Staff & Admin Portal
            </Badge>
            <h1 className="text-2xl font-extrabold text-white font-outfit">Management Sign In</h1>
            <p className="text-xs text-slate-400">Sign in with authorized staff credentials.</p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Staff Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@grandstay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <Button variant="gold" size="lg" className="w-full font-bold" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In to Admin Portal"}
            </Button>
          </form>

          <div className="text-center pt-3 border-t border-slate-800">
            <p className="text-[11px] text-slate-500">
              GrandStay Management System v1.0 • Protected Area
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500">
        © 2026 GrandStay Hotels Management System. All rights reserved.
      </footer>
    </div>
  );
}
