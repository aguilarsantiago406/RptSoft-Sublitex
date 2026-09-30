import type { Metadata } from "next";
import { TallerNestingView } from "@/features/nesting/components/TallerNestingView";

export const metadata: Metadata = {
  title: "Taller de Producción | SIPES",
  description:
    "Nesting, corte e impresión: sesiones de tela, asignación de pedidos, archivos TIF y reporte de consumo y merma.",
};

export default function TallerPage() {
  return (
    <main>
      <header className="pageHeader">
        <div>
          <h1>Taller de Producción</h1>
          <p>Nesting, corte e impresión: organiza los rollos de tela y controla el consumo real.</p>
        </div>
      </header>

      <TallerNestingView />
    </main>
  );
}

