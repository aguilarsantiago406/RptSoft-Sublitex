import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "SIPES — Sublitex", template: "%s | SIPES" },
  description: "Sistema interno de pedidos y producción de Sublitex",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-PE" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
