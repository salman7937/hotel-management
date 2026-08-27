"use client";

import React from "react";

interface PlateProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  /** "flush" removes the inner padding (for image-first catalogue cards) */
  flush?: boolean;
}

/**
 * Modern Grand Hotel — the replacement for the old glass card.
 * A plate is a hard-edged panel on slightly darker paper with a single
 * hairline border. Separation comes from the rule and spacing, never blur
 * or shadow.
 */
export const Plate: React.FC<PlateProps> = ({
  as: Tag = "div",
  flush = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <Tag
      className={`bg-paper-2 border border-rule ${flush ? "" : "p-6"} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};
