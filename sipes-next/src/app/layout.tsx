import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SIPES — Sublitex", template: "%s | SIPES" },
  description: "Sistema interno de pedidos y producción de Sublitex",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es-PE"><body>{children}</body></html>;
}
