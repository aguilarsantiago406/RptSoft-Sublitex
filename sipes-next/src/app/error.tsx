"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ maxWidth: 620, margin: "80px auto", padding: 24 }}>
      <p className="notice">No pudimos comunicarnos con el backend SIPES. Verifica que NestJS esté activo y vuelve a intentar.</p>
      <button className="primaryButton" onClick={reset} type="button">Reintentar</button>
    </main>
  );
}
