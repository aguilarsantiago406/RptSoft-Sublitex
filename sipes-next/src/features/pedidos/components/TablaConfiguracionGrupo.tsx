interface AtributoConfig {
  atributo: string;
  valor: string;
}

interface TablaConfiguracionGrupoProps {
  grupoNombre?: string;
  configuracion: AtributoConfig[];
}

export function TablaConfiguracionGrupo({
  configuracion,
}: TablaConfiguracionGrupoProps) {
  if (!configuracion || configuracion.length === 0) return null;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "6px 12px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", width: "45%" }}>
                Atributo Técnico
              </th>
              <th style={{ padding: "6px 12px", textAlign: "left", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Valor Estándar
              </th>
            </tr>
          </thead>
          <tbody>
            {configuracion.map((c, idx) => (
              <tr
                key={c.atributo}
                style={{
                  borderBottom: idx === configuracion.length - 1 ? "none" : "1px solid #f1f5f9",
                  background: idx % 2 === 0 ? "#ffffff" : "#fcfcfd",
                }}
              >
                <td style={{ padding: "6px 12px", color: "#475569", fontWeight: 600 }}>
                  {c.atributo}
                </td>
                <td style={{ padding: "6px 12px", color: "var(--navy)", fontWeight: 600 }}>
                  {c.valor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
