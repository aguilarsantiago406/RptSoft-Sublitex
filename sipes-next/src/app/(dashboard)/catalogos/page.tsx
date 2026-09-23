import {
  getTiposProducto,
  getTallas,
  getAtributos,
  getUbicaciones,
  getTarifasVigentes,
} from "@/features/catalogos/api/catalogos.api";
import { CatalogosView } from "@/features/catalogos/components/CatalogosView";

export const dynamic = "force-dynamic";

export default async function CatalogosPage() {
  const [tiposProducto, tallas, atributos, ubicaciones, tarifas] =
    await Promise.all([
      getTiposProducto().catch(() => []),
      getTallas().catch(() => []),
      getAtributos().catch(() => []),
      getUbicaciones().catch(() => []),
      getTarifasVigentes().catch(() => []),
    ]);

  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Catálogos del Sistema</h1>
          <p>
            Parámetros oficiales de prendas, piezas físicas, tallas, atributos técnicos y tarifas de confección.
          </p>
        </div>
      </header>

      <CatalogosView
        tiposProducto={tiposProducto}
        tallas={tallas}
        atributos={atributos}
        ubicaciones={ubicaciones}
        tarifas={tarifas}
      />
    </main>
  );
}
