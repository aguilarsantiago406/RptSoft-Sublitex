import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AparienciaProvider } from "@/contexts/apariencia";
import { PanelApariencia } from "@/components/apariencia/PanelApariencia";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sublitex — Gestión de pedidos",
  description: "Gestión de pedidos y de la grilla de prendas de sublitex.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AparienciaProvider>
          {children}
          <PanelApariencia />
        </AparienciaProvider>
      </body>
    </html>
  );
}