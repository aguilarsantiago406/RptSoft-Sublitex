import Link from "next/link";
import { Shirt, CheckCircle2, AlertCircle } from "lucide-react";
import type { PedidoDetalle } from "../types/pedido";
import type { ResumenProduccionItem } from "../api/comercial.api";
import styles from "./pedidos.module.css";

interface PedidoRecoleccionCardProps {
  pedido: PedidoDetalle;
  totalPrendas: number;
  resumen?: ResumenProduccionItem | null;
  mostrarEnlace?: boolean;
}

export function PedidoRecoleccionCard({
  pedido,
  totalPrendas,
  resumen = null,
  mostrarEnlace = false,
}: PedidoRecoleccionCardProps) {
  const contratadas = resumen?.totales?.cantidadContratada ?? totalPrendas;
  const registradas = resumen?.totales?.prendasRegistradas ?? 0;
  const faltantes = resumen?.totales?.prendasFaltantes ?? Math.max(contratadas - registradas, 0);
  const porcentaje = contratadas > 0 ? Math.min(Math.round((registradas / contratadas) * 100), 100) : 0;
  const estaCompleto = contratadas > 0 && faltantes === 0;

  return (
    <section className={styles.sectionBlock}>
      <div className={styles.sectionHeaderRow}>
        <div>
          <h2 className={styles.sectionTitle} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Shirt size={18} color="var(--sky-dark)" />
            RECOLECCIÓN DE DATOS
          </h2>
          <p className={styles.sectionSubtitle}>
            Progreso de asignación de tallas y participantes frente a lo contratado
          </p>
        </div>
        {mostrarEnlace && (
          <Link
            href={`/pedidos/${pedido.codigo}/prendas`}
            className={styles.linkButton}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            Gestionar Matriz de Prendas →
          </Link>
        )}
      </div>

      {/* Métricas Principales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "16px" }}>
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "var(--surface)", border: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "4px" }}>
            Contratadas
          </span>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--navy)" }}>
            {contratadas}
          </span>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <span style={{ fontSize: "0.75rem", color: "#166534", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "4px" }}>
            Registradas
          </span>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, color: "#15803d" }}>
            {registradas}
          </span>
        </div>

        <div style={{ padding: "12px 14px", borderRadius: "10px", background: estaCompleto ? "#f8fafc" : "#fffbeb", border: `1px solid ${estaCompleto ? "var(--border)" : "#fde68a"}` }}>
          <span style={{ fontSize: "0.75rem", color: estaCompleto ? "var(--muted)" : "#92400e", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: "4px" }}>
            Faltantes
          </span>
          <span style={{ fontSize: "1.35rem", fontWeight: 700, color: estaCompleto ? "var(--navy)" : "#b45309" }}>
            {faltantes}
          </span>
        </div>
      </div>

      {/* Barra de progreso */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", fontWeight: 600, marginBottom: "6px" }}>
          <span style={{ color: "var(--navy)" }}>
            {estaCompleto ? "Lista de prendas 100% completada" : "Avance de recolección de tallas"}
          </span>
          <span style={{ color: estaCompleto ? "#16a34a" : "var(--sky-dark)" }}>{porcentaje}%</span>
        </div>
        <div style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${porcentaje}%`, background: estaCompleto ? "#16a34a" : "var(--sky-dark)", transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Desglose por Grupo */}
      {resumen?.grupos && resumen.grupos.length > 0 && (
        <div style={{ display: "grid", gap: "8px" }}>
          {resumen.grupos.map((g) => (
            <div
              key={g.grupoId}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#f8fafc",
                border: "1px solid var(--border-soft)",
                fontSize: "0.84rem",
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: "var(--navy)" }}>{g.nombre}</span>
                <span style={{ color: "var(--muted)", marginLeft: "8px" }}>
                  ({g.prendasRegistradas} de {g.cantidadContratada} registradas)
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 650,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  backgroundColor: g.estado === "COMPLETO" ? "#dcfce7" : "#fef3c7",
                  color: g.estado === "COMPLETO" ? "#16a34a" : "#d97706",
                }}
              >
                {g.estado === "COMPLETO" ? "Completo" : `Faltan ${g.prendasFaltantes}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
