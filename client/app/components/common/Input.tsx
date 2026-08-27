"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Modern Grand Hotel — an underline field, like a form on hotel stationery.
 * No box, no fill: a single baseline rule that turns pine and thickens on focus.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-2xs uppercase tracking-widest text-muted"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-0 text-muted pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-transparent text-ink placeholder-muted text-base py-2 border-0 border-b transition-colors duration-150 focus:outline-none focus:border-b-2 ${
              leftIcon ? "pl-6" : "pl-0"
            } ${rightIcon ? "pr-6" : "pr-0"} ${
              error
                ? "border-stop focus:border-stop"
                : "border-rule hover:border-muted focus:border-pine"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-0 text-muted pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="font-mono text-2xs text-stop mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="font-mono text-2xs text-muted mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
