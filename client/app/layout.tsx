import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./store/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
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
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
