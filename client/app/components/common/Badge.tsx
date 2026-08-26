"use client";

import React from "react";

export type BadgeVariant =
  | "Pending"
  | "Confirmed"
  | "Checked-in"
  | "Checked-out"
  | "Cancelled"
  | "Available"
  | "Maintenance"
  | "Deactivated"
  | "gold"
  | "default"
  | "success"
  | "warning"
  | "danger";

export interface BadgeProps {
  variant?: BadgeVariant | string;
  size?: "sm" | "md";
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  children,
  className = "",
}) => {
  const styles: Record<string, string> = {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    "Checked-in": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    "Checked-out": "bg-slate-500/10 text-slate-400 border-slate-500/30",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    Available: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    Maintenance: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Deactivated: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    gold: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    default: "bg-slate-800/80 text-slate-300 border-slate-700/80",
  };

  const selectedStyle = styles[variant] || styles.default;
  const sizeStyle = size === "sm" ? "px-2.5 py-0.5 text-xs font-semibold" : "px-3 py-1 text-xs font-bold";

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm backdrop-blur-md uppercase tracking-wider ${selectedStyle} ${sizeStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {children || variant}
    </span>
  );
};
