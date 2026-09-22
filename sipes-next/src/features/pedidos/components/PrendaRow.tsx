import type { PrendaDetalle } from "../types/pedido";
import styles from "./prendas.module.css";

interface PrendaRowProps {
  index: number;
  prenda: PrendaDetalle;
}

function formatGenero(genero: string): string {
  switch (genero) {
    case "HOMBRE":
      return "Hombre";
    case "MUJER":
      return "Mujer";
    case "NINO":
      return "Niño";
    case "NINA":
      return "Niña";
    default:
      return "Estándar";
  }
}

function getGroupBadgeClass(nombreGrupo?: string | null): string {
  if (!nombreGrupo) return styles.groupBadgeDefault;
  const lower = nombreGrupo.toLowerCase();
  if (lower.includes("kit")) return styles.groupBadgeKit;
  if (lower.includes("camiseta")) return styles.groupBadgeCamiseta;
  return styles.groupBadgeDefault;
}

export function PrendaRow({ index, prenda }: PrendaRowProps) {
  const nombreGrupo = prenda.grupo?.nombre ?? "Sin grupo";
  const badgeClass = getGroupBadgeClass(nombreGrupo);
  const esSinNumero = !prenda.numero || prenda.numero === "S/N";

  return (
    <tr>
      <td className={styles.colIndex}>{index + 1}</td>
      <td>
        <span className={badgeClass}>{nombreGrupo}</span>
      </td>
      <td>
        <strong>{prenda.participante?.nombrePersona || prenda.nombreEnPrenda || "Sin registrar"}</strong>
      </td>
      <td>{prenda.nombreEnPrenda || "—"}</td>
      <td>
        <span className={esSinNumero ? styles.numeroSin : styles.numeroBadge}>
          {prenda.numero || "S/N"}
        </span>
      </td>
      <td>
        <span className={styles.tallaBadge}>{prenda.talla?.codigo || "—"}</span>
      </td>
      <td>
        <span className={styles.generoTag}>{formatGenero(prenda.genero)}</span>
      </td>
      <td>
        {prenda.color ? (
          <div className={styles.colorCell}>
            <span
              className={styles.colorDot}
              style={{ backgroundColor: prenda.color.codigoHex }}
              title={`${prenda.color.nombre} (${prenda.color.codigoHex})`}
            />
            <span>{prenda.color.nombre}</span>
          </div>
        ) : (
          <span style={{ color: "#94a3b8" }}>—</span>
        )}
      </td>
      <td>
        <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#64748b" }}>
          {prenda.tipoPrenda}
        </span>
      </td>
      <td>
        {prenda.excepciones && prenda.excepciones.length > 0 ? (
          <span className={styles.excepcionBadge} title={prenda.excepciones.map((e) => e.motivo).join(" · ")}>
            ⚠️ {prenda.excepciones.length} excepción(es)
          </span>
        ) : (
          <span style={{ color: "#cbd5e1" }}>—</span>
        )}
      </td>
    </tr>
  );
}
