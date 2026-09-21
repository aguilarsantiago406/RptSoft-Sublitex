import Link from "next/link";

export default function NotFoundPage() {
  return <main style={{ maxWidth: 620, margin: "80px auto", padding: 24 }}><h1>Pedido no encontrado</h1><p>El backend no devolvió un pedido con ese identificador.</p><Link className="primaryButton" href="/pedidos">Volver a pedidos</Link></main>;
}
