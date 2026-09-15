"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Tema = "claro" | "oscuro";

export interface Preferencias {
  tema: Tema;
  fontSize: number; // 12..16 (px base)
  fuente: string; // key del selector
}

const PREFERENCIAS_KEY = "sublitex-apariencia";

export const FUENTES = [
  { key: "system", nombre: "Sistema", stack: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" },
  { key: "serif", nombre: "Serif", stack: "Georgia, 'Times New Roman', serif" },
  { key: "mono", nombre: "Monoespaciada", stack: "'JetBrains Mono', 'Cascadia Code', Consolas, 'Courier New', monospace" },
] as const;

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 17;

interface AparienciaContextValue {
  preferencias: Preferencias;
  setTema: (tema: Tema) => void;
  setFontSize: (size: number) => void;
  setFuente: (fuente: string) => void;
}

const AparienciaContext = createContext<AparienciaContextValue | null>(null);

const DEFAULTS: Preferencias = { tema: "claro", fontSize: 14, fuente: "system" };

function cargarPreferencias(): Preferencias {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(PREFERENCIAS_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Preferencias>;
    return {
      tema: parsed.tema === "oscuro" ? "oscuro" : "claro",
      fontSize:
        typeof parsed.fontSize === "number" &&
        parsed.fontSize >= FONT_SIZE_MIN &&
        parsed.fontSize <= FONT_SIZE_MAX
          ? parsed.fontSize
          : DEFAULTS.fontSize,
      fuente: FUENTES.some((f) => f.key === parsed.fuente)
        ? (parsed.fuente as string)
        : DEFAULTS.fuente,
    };
  } catch {
    return DEFAULTS;
  }
}

export function AparienciaProvider({ children }: { children: React.ReactNode }) {
  const [preferencias, setPreferencias] = useState<Preferencias>(DEFAULTS);

  // Hidratar preferencias guardadas una sola vez en el cliente
  useEffect(() => {
    setPreferencias(cargarPreferencias());
  }, []);

  const setTema = useCallback((tema: Tema) => {
    setPreferencias((prev) => ({ ...prev, tema }));
  }, []);

  const setFontSize = useCallback((fontSize: number) => {
    setPreferencias((prev) => ({ ...prev, fontSize }));
  }, []);

  const setFuente = useCallback((fuente: string) => {
    setPreferencias((prev) => ({ ...prev, fuente }));
  }, []);

  // Persistir + aplicar al <html>
  useEffect(() => {
    const root = document.documentElement;
    const fuente =
      FUENTES.find((f) => f.key === preferencias.fuente) ?? FUENTES[0];

    root.dataset.tema = preferencias.tema;
    root.style.setProperty("--base-font-size", `${preferencias.fontSize}px`);
    root.style.setProperty("--app-font-family", fuente.stack);
    window.localStorage.setItem(PREFERENCIAS_KEY, JSON.stringify(preferencias));
  }, [preferencias]);

  const value = useMemo(
    () => ({ preferencias, setTema, setFontSize, setFuente }),
    [preferencias, setTema, setFontSize, setFuente]
  );

  return (
    <AparienciaContext.Provider value={value}>
      {children}
    </AparienciaContext.Provider>
  );
}

export function useApariencia(): AparienciaContextValue {
  const ctx = useContext(AparienciaContext);
  if (!ctx) {
    throw new Error("useApariencia debe usarse dentro de <AparienciaProvider>");
  }
  return ctx;
}