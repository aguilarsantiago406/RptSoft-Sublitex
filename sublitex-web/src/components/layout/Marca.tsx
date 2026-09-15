"use client";

import Link from "next/link";

export function Marca() {
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