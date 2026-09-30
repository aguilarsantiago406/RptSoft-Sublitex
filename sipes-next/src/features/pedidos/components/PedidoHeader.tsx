import styles from "./pedidos.module.css";

interface PedidoHeaderProps {
  titulo?: string;
  subtitulo?: string;
}

/* El código y el estado ya viven en la barra de pedido; el header de la
   section solo aporta su título. */
export function PedidoHeader({
  titulo = "DATOS DEL PEDIDO",
  subtitulo = "Ficha técnica operativa",
}: PedidoHeaderProps) {
  return (
    <header className={styles.detailHeader}>
      <div className={styles.detailHeaderMain}>
        <h1 className={styles.detailHeaderTitle}>{titulo}</h1>
        <p className={styles.detailHeaderSubtitle}>
          <span>{subtitulo}</span>
        </p>
      </div>
    </header>
  );
}
