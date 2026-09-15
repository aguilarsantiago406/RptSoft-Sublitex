"use client";

/** Chip que indica que la app corre contra datos mock (entorno MOCK). */
export function EntornoMock() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
      title="Datos simulados — Sprint 1"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 ring-1 ring-amber-600/40 dark:bg-amber-400" aria-hidden="true" />
      Entorno Mock
    </span>
  );
}