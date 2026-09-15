"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import {
  alternarTema,
  definirTema,
  obtenerTema,
  suscribirTema,
  type Tema,
} from "@/lib/tema";

interface ContextoTema {
  tema: Tema;
  alternarTema: () => void;
  definirTema: (tema: Tema) => void;
}

const TemaContexto = createContext<ContextoTema | null>(null);

/**
 * Provee el tema claro/oscuro de toda la app.
 * La clase `dark` se aplica sobre <html> (variantes `dark:` de Tailwind) y la
 * preferencia se persiste en localStorage. El script inline del layout la fija
 * antes de hidratar para evitar parpadeo; acá solo se suscriben componentes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const tema = useSyncExternalStore<Tema>(suscribirTema, obtenerTema, () => "light");

  const valor = useMemo(
    () => ({ tema, alternarTema, definirTema }),
    [tema]
  );

  return <TemaContexto.Provider value={valor}>{children}</TemaContexto.Provider>;
}

export function useTema(): ContextoTema {
  const ctx = useContext(TemaContexto);
  if (!ctx) {
    throw new Error("useTema debe usarse dentro de <ThemeProvider>");
  }
  return ctx;
}