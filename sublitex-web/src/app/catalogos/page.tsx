import { VistaCatalogos } from "@/components/catalogos/VistaCatalogos";

export const metadata = {
  title: "Catálogos y Tarifas · SIPES Sublitex",
  description: "Catálogos comerciales, componentes físicos y listas cerradas",
};

export default function CatalogosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Catálogos Comerciales y Tarifas
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Consulta de productos, componentes físicos para corte, recargos y parámetros comerciales vigentes.
        </p>
      </div>

      <VistaCatalogos />
    </div>
  );
}
