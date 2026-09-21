/**
 * Mini-logger legible del frontend (sin dependencias).
 *
 * Formato: `[NIVEL] [Scope] mensaje`
 * - debug   → solo en desarrollo (NODE_ENV !== "production")
 * - warn → siempre en consola
 * - error   → siempre, con extras opcionales
 *
 * Regla anti-ruido: cada evento se loguea UNA sola vez, en su frontera
 * (apiClient = ERROR técnico, hooks = WARN de la UI). Nunca loguear
 * tokens, contraseñas ni datos personales.
 */

const ES_PROD = process.env.NODE_ENV === "production";

type Nivel = "debug" | "info" | "warn" | "error";

function setColor(nivel: Nivel): string {
  switch (nivel) {
    case "debug":
      return "color:#8a8578";
    case "info":
      return "color:#1c5a3e";
    case "warn":
      return "color:#b45309";
    case "error":
      return "color:#b3261e;font-weight:600";
  }
}

function emitir(nivel: Nivel, scope: string, mensaje: string, extras?: unknown): void {
  const etiqueta = nivel.toUpperCase().padEnd(5, " ");
  const consoleFn = nivel === "warn" ? console.warn : nivel === "error" ? console.error : console.log;

  // console.* con %c solo en browser/dev; texto plano en otros entornos.
  if (extras === undefined) {
    try {
      consoleFn(`%c[${etiqueta}] [${scope}] ${mensaje}`, setColor(nivel));
    } catch {
      consoleFn(`[${etiqueta}] [${scope}] ${mensaje}`);
    }
  } else {
    try {
      consoleFn(`%c[${etiqueta}] [${scope}] ${mensaje}`, setColor(nivel), extras);
    } catch {
      consoleFn(`[${etiqueta}] [${scope}] ${mensaje}`, extras);
    }
  }
}

export const logger = {
  debug(scope: string, mensaje: string, extras?: unknown): void {
    if (!ES_PROD) emitir("debug", scope, mensaje, extras);
  },
  info(scope: string, mensaje: string, extras?: unknown): void {
    if (!ES_PROD) emitir("info", scope, mensaje, extras);
  },
  warn(scope: string, mensaje: string, extras?: unknown): void {
    emitir("warn", scope, mensaje, extras);
  },
  error(scope: string, mensaje: string, extras?: unknown): void {
    emitir("error", scope, mensaje, extras);
  },
};