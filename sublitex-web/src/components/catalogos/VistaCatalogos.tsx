"use client";

import { obtenerCatalogos, ErrorApi } from "@/services/cliente";
import { useAsync } from "@/components/ui/use-async";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ParametrosComerciales } from "@/components/catalogos/ParametrosComerciales";
import { TablaCatalogos } from "@/components/catalogos/TablaCatalogos";

export function VistaCatalogos() {
  const { datos, error, cargando, recargar } = useAsync(obtenerCatalogos);

  if (cargando) {
    return <Spinner />;
  }

  if (error) {
    return (
      <ErrorBanner
        error={
          error instanceof ErrorApi
            ? error
            : new ErrorApi("R-CONTRATO", error.message, 502)
        }
        alReintentar={recargar}
      />
    );
  }

  if (!datos) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <ParametrosComerciales parametros={datos.parametros} />
      <TablaCatalogos catalogos={datos} />
    </div>
  );
}
