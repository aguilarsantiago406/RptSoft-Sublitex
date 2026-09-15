"use client";

export function Perfil() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-3 sm:flex dark:border-slate-700">
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white"
        aria-hidden="true"
      >
        RC
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          Rosa Castro
        </span>
        <span className="block text-[10px] text-slate-500 dark:text-slate-400">
          Administración de pedidos
        </span>
      </span>
    </div>
  );
}