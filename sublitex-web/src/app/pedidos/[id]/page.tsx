"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { usePedidoDetalle } from "@/hooks/usePedidoDetalle";
import { useGrupoPrendas } from "@/hooks/useGrupoPrendas";
import { TablaPrendas } from "@/components/prendas/TablaPrendas";
import { calcularTotales, TOTALES_VACIOS } from "@/domain/calculoTotales";

interface PageProps {
  params: Promise<{ id: string }>;
}

const NOMBRE_ATRIBUTO: Record<string, string> = {
  CUELLO: "Cuello",
  TELA: "Tela",
  CORTE: "Corte",
  ACABADO: "Acabado",
};

export default function PaginaDetallePedido({ params }: PageProps) {
  const resolvedParams = use(params);
  const pedidoId = resolvedParams.id;

  const { pedido, tarifas, catalogo, cargando, error } =
    usePedidoDetalle(pedidoId);

  // La grilla SIEMPRE sale del grupo (§5.1); el encabezado nunca trae prendas (§3.3)
  const grupo = pedido?.grupos[0];
  const { prendas, grupo: grupoGrilla, cargando: cargandoGrilla, error: errorGrilla, actualizarPrenda } =
    useGrupoPrendas(grupo?.id, grupo?.configuracion);

  const totales = useMemo(
    () => (catalogo ? calcularTotales(prendas, tarifas, catalogo) : TOTALES_VACIOS),
    [prendas, tarifas, catalogo]
  );

  if (cargando || cargandoGrilla) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p>Cargando pedido {pedidoId}, tarifas y grilla del grupo desde la API...</p>
      </main>
    );
  }

  if (error || !pedido || !catalogo) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p style={{ color: "#d32f2f" }}>Error: {error || "No se pudo cargar la información"}</p>
        <Link href="/pedidos">Volver a la lista</Link>
      </main>
    );
  }

  if (errorGrilla || !grupoGrilla) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <p style={{ color: "#d32f2f" }}>Error: {errorGrilla || "No se pudo cargar la grilla del grupo"}</p>
        <Link href="/pedidos">Volver a la lista</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem 2rem", fontFamily: "Arial, sans-serif" }}>
      {/* Navegación y Encabezado Comercial */}
      <div style={{ marginBottom: "1.2rem" }}>
        <Link
          href="/pedidos"
          style={{ textDecoration: "none", color: "#1565c0", fontSize: 13, fontWeight: 600 }}
        >
          ← Volver a lista de pedidos
        </Link>
        <h1 style={{ margin: "0.5rem 0 0.2rem 0", fontSize: "1.4rem" }}>
          {pedido.codigo} — {pedido.cliente.nombre}
        </h1>
        <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
          Grupo: <strong>{grupo?.nombre}</strong> · Producto:{" "}
          <strong>{grupo?.tipoProducto.nombre}</strong>
        </p>

        {/* Configuración base del grupo (valores que toda prenda hereda) */}
        {grupo && grupo.configuracion.length > 0 && (
          <p style={{ margin: "0.25rem 0 0 0", color: "#666", fontSize: 13 }}>
            Configuración base:{" "}
            {grupo.configuracion
              .map(
                (c) =>
                  `${NOMBRE_ATRIBUTO[c.atributo] ?? c.atributo} ${c.valor}`
              )
              .join(" · ")}
          </p>
        )}

        {/* Paleta oficial de colores con HEX — R-K05 */}
        <div
          style={{
            marginTop: "0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            fontSize: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontWeight: 600, color: "#333" }}>Colores oficiales del pedido:</span>
          {pedido.colores.map((c) => (
            <span key={c.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  backgroundColor: c.codigoHex,
                  border: "1px solid #999",
                }}
              />
              <span>
                {c.nombre} ({c.codigoHex})
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Grilla de prendas: 25 columnas, valores efectivos y sus orígenes */}
      <TablaPrendas
        prendas={prendas}
        colores={pedido.colores}
        tarifas={tarifas}
        catalogo={catalogo}
        totales={totales}
        onActualizarPrenda={actualizarPrenda}
      />
    </main>
  );
}