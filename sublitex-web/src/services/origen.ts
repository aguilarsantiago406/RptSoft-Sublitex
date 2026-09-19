export type Origen = "simulador" | "backend";

export function origenActual(): Origen {
  return process.env.SIPES_BACKEND_URL ? "backend" : "simulador";
}

export function respaldoBackend(): string {
  const url = process.env.SIPES_BACKEND_URL;
  if (!url) {
    throw new Error("SIPES_BACKEND_URL no está configurada");
  }
  return url.replace(/\/$/, "");
}