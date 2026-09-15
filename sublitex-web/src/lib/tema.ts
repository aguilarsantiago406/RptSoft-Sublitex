/**
 * Almacén externo del tema (Light/Dark). Vive fuera de React: la fuente de
 * verdad es la clase `dark` sobre <html>, que el script inline del layout fija
 * antes de hidratar. Los componentes se suscriben con useSyncExternalStore.
 */

export type Tema = "light" | "dark";

export const CLAVE_TEMA = "sublitex-tema";

let temaActual: Tema = "light";
const escuchas = new Set<() => void>();

export function obtenerTema(): Tema {
  return temaActual;
}

export function suscribirTema(escucha: () => void): () => void {
  escuchas.add(escucha);
  return () => {
    escuchas.delete(escucha);
  };
}

function avisar() {
  escuchas.forEach((fn) => fn());
}

export function aplicarClaseTema(tema: Tema) {
  if (typeof document === "undefined") return;
  const raiz = document.documentElement;
  raiz.classList.toggle("dark", tema === "dark");
  raiz.style.colorScheme = tema;
}

export function definirTema(tema: Tema) {
  aplicarClaseTema(tema);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CLAVE_TEMA, tema);
  }
  if (temaActual !== tema) {
    temaActual = tema;
    avisar();
  }
}

export function alternarTema() {
  definirTema(temaActual === "dark" ? "light" : "dark");
}

export function inicializarTema(): Tema {
  if (typeof window === "undefined") return "light";
  const guardado = window.localStorage.getItem(CLAVE_TEMA);
  const tema: Tema =
    guardado === "light" || guardado === "dark"
      ? guardado
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  temaActual = tema;
  return tema;
}

// En el navegador, sincroniza el contador del store con la preferencia
// guardada (o la del sistema) desde la carga del módulo.
if (typeof window !== "undefined") {
  inicializarTema();
}