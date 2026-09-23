import { getFichaParticipantePublica } from "@/features/participantes/api/portal.api";
import { getTallasCatalogo } from "@/features/pedidos/api/pedidos.api";
import { PortalParticipanteView } from "@/features/participantes/components/portal/PortalParticipanteView";
import styles from "@/features/participantes/components/portal/portal.module.css";

interface ParticipantePageProps {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function ParticipantePublicPage({ params }: ParticipantePageProps) {
  const { token } = await params;

  let participante = null;
  let errorMsg: string | null = null;
  let tallas: Array<{ id: string; tipoProductoId: string; codigo: string; etiqueta: string }> = [];

  try {
    const [ficha, tallasCatalogo] = await Promise.all([
      getFichaParticipantePublica(token),
      getTallasCatalogo(),
    ]);
    participante = ficha;
    tallas = tallasCatalogo;
  } catch (err: any) {
    if (err?.status === 410) {
      errorMsg = "Este enlace ha expirado o fue revocado por el coordinador.";
    } else if (err?.status === 404) {
      errorMsg = "El enlace no existe o es incorrecto.";
    } else {
      errorMsg = err?.message ?? "No se pudo cargar la información del participante.";
    }
  }

  if (errorMsg || !participante) {
    return (
      <div className={styles.container}>
        <header className={styles.brandHeader}>
          <div className={styles.brandLogo}>SUBLITEX</div>
          <div className={styles.brandSubtitle}>Ficha Técnica de Participante</div>
        </header>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.greeting}>Enlace no disponible</h1>
            <p className={styles.cardInstruction}>
              No pudimos acceder a la ficha técnica de tu prenda.
            </p>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.errorBanner}>{errorMsg}</div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
              Por favor comunicate con el coordinador de tu pedido o colegio para solicitar un enlace actualizado.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return <PortalParticipanteView participante={participante} tallas={tallas} />;
}
