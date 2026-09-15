"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Marca } from "./Marca";
import { EntornoMock } from "./EntornoMock";

export function Sidebar() {
  const pathname = usePathname();
  const activo = pathname?.startsWith("/pedidos");

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-slate-100/80 backdrop-blur-md lg:flex dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md">
      <div className="flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <Marca />
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-1 px-3 py-4">
        <Link
          href="/pedidos"
          className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            activo
              ? "bg-emerald-700 text-white shadow-sm dark:bg-emerald-600/30 dark:text-emerald-200"
              : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          }`}
        >
          Pedidos
        </Link>
      </nav>

      <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
        <EntornoMock />
        <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
          Sprint 1 — datos simulados del Contrato API v1.1
        </p>
      </div>
    </aside>
  );
}