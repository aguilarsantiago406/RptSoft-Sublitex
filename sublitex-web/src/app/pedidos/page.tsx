"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { EstadoPedido, PedidoResumen } from "@/types/pedidos";

// ---------------------------------------------------------------------------
// Estilos de estado
// ---------------------------------------------------------------------------

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  BORRADOR: "Borrador",
  EN_CONFIGURACION: "En configuración",
  EN_RECOLECCION: "En recolección",
  EN_REVISION: "En revisión",
  CERRADO: "Cerrado",
  EN_PRODUCCION: "En producción",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const ESTADO_COLOR: Record<EstadoPedido, { bg: string; color: string }> = {
  BORRADOR: { bg: "#f0f0f0", color: "#666" },
  EN_CONFIGURACION: { bg: "#e3f0ff", color: "#1565c0" },
  EN_RECOLECCION: { bg: "#fff3cd", color: "#b45309" },
  EN_REVISION: { bg: "#fce4ec", color: "#c2185b" },
  CERRADO: { bg: "#e8f5e9", color: "#2e7d32" },
  EN_PRODUCCION: { bg: "#e8eaf6", color: "#3949ab" },
  ENTREGADO: { bg: "#e8f5e9", color: "#1b5e20" },
  CANCELADO: { bg: "#fbe9e7", color: "#bf360c" },
};

// ---------------------------------------------------------------------------
// Componente de Vista
// ---------------------------------------------------------------------------

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pedidos")
      .then((res) => {
        if (!res.ok) throw new Error("Error al consultar /api/pedidos");
        return res.json();
      })
      .then((data: PedidoResumen[]) => {
        setPedidos(data);
        setCargando(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setCargando(false);
      });
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif", maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Pedidos</h1>
        <button
          style={{
            background: "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Nuevo pedido
        </button>
      </div>

      {cargando && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Cargando pedidos desde la API...
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", background: "#fee2e2", color: "#b91c1c", borderRadius: 6, marginBottom: "1rem" }}>
          Error: {error}
        </div>
      )}

      {!cargando && !error && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f7f7f7", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0" }}>Código</th>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0" }}>Cliente</th>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0" }}>Estado</th>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0", textAlign: "center" }}>Prendas</th>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0" }}>Entrega</th>
              <th style={{ padding: "10px 12px", borderBottom: "2px solid #e0e0e0" }} />
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p, i) => {
              const estadoStyle = ESTADO_COLOR[p.estado];
              return (
                <tr
                  key={p.id}
                  style={{ background: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "10px 12px", fontWeight: 600, fontFamily: "monospace" }}>
                    {p.codigo}
                  </td>
                  <td style={{ padding: "10px 12px" }}>{p.cliente.nombre}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        background: estadoStyle.bg,
                        color: estadoStyle.color,
                        borderRadius: 20,
                        padding: "3px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ESTADO_LABEL[p.estado]}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>
                    {p.totalPrendas > 0 ? p.totalPrendas : "—"}
                  </td>
                  <td style={{ padding: "10px 12px", color: p.fechaCompromiso ? "#333" : "#aaa" }}>
                    {p.fechaCompromiso
                      ? new Date(p.fechaCompromiso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })
                      : "Sin fecha"}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <Link
                      href={`/pedidos/${p.id}`}
                      style={{
                        background: "#1565c0",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "5px 12px",
                        textDecoration: "none",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
