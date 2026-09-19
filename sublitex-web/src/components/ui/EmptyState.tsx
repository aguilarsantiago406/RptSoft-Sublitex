export function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
      {mensaje}
    </div>
  );
}