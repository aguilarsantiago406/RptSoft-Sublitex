import {
  getTiposProducto,
  getTallas,
  getAtributos,
  getUbicaciones,
  getTarifas,
} from "@/features/catalogos/api/catalogos.api";
import { CatalogosView } from "@/features/catalogos/components/CatalogosView";
import { loadData } from "@/lib/api/loadData";

export const dynamic = "force-dynamic";

export default async function CatalogosPage() {
  const [tiposProductoRes, tallasRes, atributosRes, ubicacionesRes, tarifasRes] =
    await Promise.all([
      loadData(() => getTiposProducto()),
      loadData(() => getTallas()),
      loadData(() => getAtributos()),
      loadData(() => getUbicaciones()),
      loadData(() => getTarifas()),
    ]);

  const errores = [
    ["Tipos de producto", tiposProductoRes.error],
    ["Tallas", tallasRes.error],
    ["Atributos", atributosRes.error],
    ["Ubicaciones", ubicacionesRes.error],
    ["Tarifas", tarifasRes.error],
  ]
    .filter(([, mensaje]) => mensaje !== null)
    .map(([seccion, mensaje]) => `${seccion}: ${mensaje}`);

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
        tiposProducto={tiposProductoRes.data ?? []}
        tallas={tallasRes.data ?? []}
        atributos={atributosRes.data ?? []}
        ubicaciones={ubicacionesRes.data ?? []}
        tarifas={tarifasRes.data ?? []}
        error={errores.length > 0 ? errores.join(" · ") : null}
      />
    </main>
  );
}
