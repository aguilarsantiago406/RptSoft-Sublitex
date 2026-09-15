import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sublitex — SIPES · Gestión de pedidos",
  description:
    "Sistema de pedidos de Sublitex: gestión de pedidos, prendas y producción.",
};

/**
 * Script inline que fija la clase `dark` en <html> ANTES de que React
 * hidrate, evitando un parpadeo (FOUC) al cambiar de tema.
 */
const SCRIPT_TEMA = `
(function(){
  try{
    var t=localStorage.getItem('sublitex-tema');
    var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches);
    var r=document.documentElement;
    r.classList.toggle('dark',d);
    r.style.colorScheme=d?'dark':'light';
  }catch(e){}
})()
`.trim();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        <ThemeProvider>
          <ToastProvider>
            <Sidebar />
            <div className="min-w-0 lg:pl-64">
              <Header />
              <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-4 sm:px-6">
                {children}
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}