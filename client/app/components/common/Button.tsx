"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Modern Grand Hotel — a button is a stamped rectangle.
 * Flat fill, no radius, no shadow, no scale. The label is set in the
 * mono face, uppercase, like something pressed into metal.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-mono uppercase tracking-wider " +
    "transition-colors duration-150 focus:outline-none focus-visible:outline-2 " +
    "focus-visible:outline-offset-2 focus-visible:outline-pine " +
    "disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border";

  const variants: Record<string, string> = {
    // Primary action — solid pine plate
    primary: "bg-pine text-paper border-pine hover:bg-pine-deep hover:border-pine-deep",
    gold: "bg-pine text-paper border-pine hover:bg-pine-deep hover:border-pine-deep",
    // Secondary — outline on paper
    secondary: "bg-transparent text-pine border-pine hover:bg-pine hover:text-paper",
    outline: "bg-transparent text-pine border-pine hover:bg-pine hover:text-paper",
    // Destructive
    danger: "bg-transparent text-stop border-stop hover:bg-stop hover:text-paper",
    // Ghost — label only, animated underline, no box
    ghost:
      "bg-transparent border-transparent text-ink underline decoration-rule " +
      "underline-offset-4 hover:decoration-pine hover:text-pine",
  };

  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-2xs gap-1.5",
    md: "px-4 py-2.5 text-xs gap-2",
    lg: "px-6 py-3.5 text-sm gap-2.5",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        leftIcon && <span className="inline-flex">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
    </button>
  );
};
