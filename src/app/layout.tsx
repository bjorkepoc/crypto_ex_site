import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { PrefsProvider } from "@/lib/preferences";
import { ThemeInit } from "@/components/ThemeInit";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CryptoEx — TTM4135 Exam Practice",
  description: "Practice for TTM4135 Applied Cryptography exam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-th-page`}
      >
        <PrefsProvider>
          <ThemeInit />
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </PrefsProvider>
      </body>
    </html>
  );
}
