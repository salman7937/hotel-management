import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Fragment_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./store/Providers";

// Display — a wonky, high-contrast old-style serif. Used large and flush-left.
const display = Fraunces({
  variable: "--ff-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Interface / body — a clean humanist grotesque.
const sans = Instrument_Sans({
  variable: "--ff-sans",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

// Data — every room number, price, date and booking ID.
const mono = Fragment_Mono({
  variable: "--ff-mono",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GrandStay Hotels — Premium Luxury & Hotel Management System",
  description:
    "Experience luxury at GrandStay Hotels. Browse rooms, check real-time availability, and reserve your stay online.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
