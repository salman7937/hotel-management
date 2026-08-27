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

/**
 * Modern Grand Hotel — a label, not a pill.
 * Set in the mono face, uppercase, no background. State is carried by the
 * text colour: pine = good, brass = in-progress, rust = stopped.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  children,
  className = "",
}) => {
  const tone: Record<string, string> = {
    Confirmed: "text-pine",
    Available: "text-pine",
    "Checked-in": "text-pine",
    success: "text-pine",

    Pending: "text-brass",
    Maintenance: "text-brass",
    warning: "text-brass",
    gold: "text-brass",
    "Checked-out": "text-muted",
    default: "text-muted",

    Cancelled: "text-stop",
    Deactivated: "text-stop",
    danger: "text-stop",
  };

  const color = tone[variant] || tone.default;
  const sizeStyle = size === "sm" ? "text-2xs" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-widest ${color} ${sizeStyle} ${className}`}
    >
      <span aria-hidden className="inline-block w-1 h-1 bg-current" />
      {children || variant}
    </span>
  );
};
