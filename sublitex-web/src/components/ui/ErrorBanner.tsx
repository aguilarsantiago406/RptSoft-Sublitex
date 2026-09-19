import { ErrorApi } from "@/services/cliente";

export function ErrorBanner({ error, alReintentar }: { error: ErrorApi | null; alReintentar?: () => void }) {
  if (!error) return null;
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      <p className="font-medium">
        {error.codigo ? `[${error.codigo}] ` : ""}
        {error.mensaje}
      </p>
      <p className="mt-1 text-xs text-red-600">No se muestran datos de demostración cuando el origen falla.</p>
      {alReintentar && (
        <button onClick={alReintentar} className="mt-2 rounded border border-red-300 bg-white px-2 py-1 text-xs font-medium hover:bg-red-100">
          Reintentar
        </button>
      )}
    </div>
  );
}