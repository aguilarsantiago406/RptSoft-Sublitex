"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function Marca() {
  return (
    <Link
      href="/pedidos"
      className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white dark:bg-slate-100 dark:text-slate-900">
        S
      </span>
      <span className="leading-tight">
        Sublitex
        <span className="block text-[10px] font-medium uppercase tracking-widest text-slate-400">
          SIPES · Pedidos
        </span>
      </span>
    </Link>
  );
}

function Perfil() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 sm:flex dark:border-slate-700">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">
        MC
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          María Cárdenas
        </span>
        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
          Administración de pedidos
        </span>
      </span>
    </div>
  );
}

export function Shell() {
  const pathname = usePathname();
  const activo = pathname?.startsWith("/pedidos");

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md dark:text-slate-100">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Marca />
          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            <Link
              href="/pedidos"
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activo
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              }`}
            >
              Pedidos
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Perfil />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}