export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-zinc-500" role="status">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
      Cargando…
    </div>
  );
}