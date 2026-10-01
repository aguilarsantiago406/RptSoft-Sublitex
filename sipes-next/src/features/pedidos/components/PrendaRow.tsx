"use client";

import { useState, useTransition } from "react";
import type { UbicacionPersonalizacionCatalogo } from "@/features/catalogos/types/catalogo";
import type { AtributoCatalogoItem } from "../api/pedidos.api";
import type { PrendaDetalle } from "../types/pedido";
import { actionEliminarPrenda } from "../actions/prendas.actions";
import { Pencil, Trash2 } from "lucide-react";
import { ModalEditarPrenda } from "./ModalEditarPrenda";
import { ModalConfirmacion } from "@/components/ui/ModalConfirmacion";
import styles from "./prendas.module.css";

interface PrendaRowProps {
  index: number;
  prenda: PrendaDetalle;
  pedidoId: string;
  tallasDisponibles: Array<{ id: string; codigo: string; etiqueta: string }>;
  atributosCatalogo: AtributoCatalogoItem[];
  coloresDisponibles?: Array<{ id: string; nombre: string; codigoHex: string }>;
  ubicacionesCatalogo?: UbicacionPersonalizacionCatalogo[];
}

const GENERO_MAP: Record<string, string> = { HOMBRE: "Hombre", MUJER: "Mujer", NINO: "Niño", NINA: "Niña" };

function getTipoPrendaInfo(tipo: string) {
  if (tipo === "OBSEQUIO") return { label: "Obsequio", bg: "#dcfce7", color: "#166534", border: "#bbf7d0" };
  if (tipo === "MUESTRA") return { label: "Muestra", bg: "#e0f2fe", color: "#0369a1", border: "#bae6fd" };
  return { label: "Venta", bg: "#f1f5f9", color: "#334155", border: "#e2e8f0" };
}

export function PrendaRow({
  index, prenda, pedidoId,
  tallasDisponibles, atributosCatalogo,
  coloresDisponibles, ubicacionesCatalogo,
}: PrendaRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const colorEfectivo = prenda.color ?? coloresDisponibles?.[0] ?? null;
  const tipoInfo = getTipoPrendaInfo(prenda.tipoPrenda);
  const esSinNumero = !prenda.numero || prenda.numero === "S/N";
  const etiqueta = prenda.participante?.nombrePersona || prenda.nombreEnPrenda || "la prenda";
  const detalleNumero = esSinNumero ? "" : ` (N° ${prenda.numero})`;

  function handleConfirmEliminar() {
    if (isDeleting) return;
    setErrorMsg(null);
    setIsDeleting(true);
    startTransition(async () => {
      const res = await actionEliminarPrenda(prenda.id, pedidoId);
      setIsDeleting(false);
      setIsConfirmOpen(false);
      if (!res.ok) setErrorMsg(res.error || "No se pudo eliminar la prenda.");
    });
  }

  return (
    <tr>
      <td className={styles.colIndex}>{index + 1}</td>
      <td className={styles.cellTruncate}>
        <span className={styles.participanteName} title={prenda.participante?.nombrePersona || prenda.nombreEnPrenda || "Sin registrar"}>
          {prenda.participante?.nombrePersona || prenda.nombreEnPrenda || "Sin registrar"}
        </span>
      </td>
      <td className={styles.cellTruncate}>
        <span title={prenda.nombreEnPrenda || "—"}>{prenda.nombreEnPrenda || "—"}</span>
      </td>
      <td>
        <span className={esSinNumero ? styles.numeroSin : styles.numeroBadge}>{prenda.numero || "S/N"}</span>
      </td>
      <td>
        <span className={styles.tallaBadge}>{prenda.talla?.codigo || "—"}</span>
      </td>
      <td>
        <span className={styles.generoBadge}>{GENERO_MAP[prenda.genero] ?? "Estándar"}</span>
      </td>
      <td>
        {colorEfectivo ? (
          <span className={styles.colorCell} title={colorEfectivo.nombre}>
            <span className={styles.colorDot} style={{ backgroundColor: colorEfectivo.codigoHex }} />
            <span className={styles.colorName}>{colorEfectivo.nombre}</span>
          </span>
        ) : (
          <span style={{ color: "#cbd5e1" }}>—</span>
        )}
      </td>
      <td>
        <span
          style={{
            display: "inline-block", padding: "2px 7px", borderRadius: "5px", fontSize: "0.72rem",
            fontWeight: 400, background: tipoInfo.bg, color: tipoInfo.color,
            border: `1px solid ${tipoInfo.border}`, whiteSpace: "nowrap",
          }}
        >
          {tipoInfo.label}
        </span>
        {prenda.esArquero && (
          <span
            style={{
              display: "inline-block", marginLeft: "4px", padding: "2px 6px", borderRadius: "5px",
              fontSize: "0.7rem", fontWeight: 400, background: "#fef9c3", color: "#854d0e",
              border: "1px solid #fde047", whiteSpace: "nowrap",
            }}
          >
            Arquero
          </span>
        )}
      </td>
      <td>
        {prenda.personalizaciones && prenda.personalizaciones.length > 0 ? (
          <span
            title={prenda.personalizaciones.map((p) => `${p.ubicacion?.etiqueta ?? "Estampado"}: "${p.contenido}"`).join(" · ")}
            style={{
              display: "inline-block", padding: "2px 6px", borderRadius: "4px", fontSize: "0.72rem",
              fontWeight: 400, background: "#ccfbf1", color: "#0f766e", border: "1px solid #99f6e4",
              whiteSpace: "nowrap", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {prenda.personalizaciones.length === 1
              ? prenda.personalizaciones[0].contenido
              : `${prenda.personalizaciones.length} estampados`}
          </span>
        ) : (
          <span style={{ color: "#cbd5e1" }}>—</span>
        )}
      </td>
      <td>
        {prenda.excepciones && prenda.excepciones.length > 0 ? (
          <span className={styles.excepcionBadge} title={prenda.excepciones.map((e) => e.motivo).join(" · ")}>
            {prenda.excepciones.length} excepción(es)
          </span>
        ) : (
          <span style={{ color: "#cbd5e1" }}>—</span>
        )}
      </td>
      <td>
        <div className={styles.rowActions}>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => setIsEditing(true)}
            title="Editar prenda"
            aria-label="Editar prenda"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => setIsConfirmOpen(true)}
            disabled={isDeleting}
            title="Eliminar prenda"
            aria-label="Eliminar prenda"
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "5px 7px" }}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {errorMsg && <div className={styles.rowActionError} role="alert">{errorMsg}</div>}

        {isEditing && (
          <ModalEditarPrenda
            isOpen={isEditing} onClose={() => setIsEditing(false)} prenda={prenda} pedidoId={pedidoId}
            tallasDisponibles={tallasDisponibles} atributosCatalogo={atributosCatalogo}
            coloresDisponibles={coloresDisponibles} ubicacionesCatalogo={ubicacionesCatalogo}
          />
        )}

        <ModalConfirmacion
          isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmEliminar}
          title="Eliminar Prenda" confirmText="Eliminar Prenda" variant="danger" isPending={isDeleting}
          description={`¿Eliminar la prenda de ${etiqueta}${detalleNumero}? La prenda se quitará del pedido de forma permanente.`}
        />
      </td>
    </tr>
  );
}
