"use client";

import { useTema } from "./ThemeProvider";

function IconoSol() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.9 2.1a1 1 0 010 1.4l-.7.7a1 1 0 01-1.4-1.4l.7-.7a1 1 0 011.4 0zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 5.5a1 1 0 011.4 0l.7.7a1 1 0 01-1.4 1.4l-.7-.7a1 1 0 010-1.4zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zm4.95 4.45a1 1 0 000 1.4l.7.7a1 1 0 001.4-1.4l-.7-.7a1 1 0 00-1.4 0zM10 14a4 4 0 100-8 4 4 0 000 8zm0 2a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm6.85-2.05a1 1 0 00-1.4-1.4l-.7.7a1 1 0 001.4 1.4l.7-.7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconoLuna() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  );
}

/**
 * Conmutador de tema claro/oscuro.
 * El marcado es idéntico en ambos temas: el icono y el texto se intercambian
 * con variantes `dark:` para no generar diferencias de hidratación. El texto
 * anuncia la acción (el tema al que se va a pasar).
 */
export function ThemeToggle() {
  const { alternarTema } = useTema();

  return (
    <button
      type="button"
      onClick={alternarTema}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Cambiar entre modo claro y oscuro"
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <span className="dark:hidden">
        <IconoLuna />
      </span>
      <span className="hidden dark:inline">
        <IconoSol />
      </span>
      <span className="hidden sm:inline dark:hidden">Oscuro</span>
      <span className="hidden dark:sm:inline">Claro</span>
    </button>
  );
}