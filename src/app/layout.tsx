import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Outfit } from "next/font/google";
import { headers } from "next/headers";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "RISA | Institute of Applied Sciences",
    template: "%s | RISA",
  },
  description:
    "RISA Institute of Applied Sciences — a developing platform for practical learning in science, engineering and technology.",
  icons: { icon: "/risa-logo.svg" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Nonces are per-request; static HTML cannot receive matching script nonces.
  await headers();

  return (
    <html lang="en">
      <body
        className={`${outfit.variable} flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased`}
      >
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
