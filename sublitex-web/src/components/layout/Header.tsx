"use client";

import { Marca } from "./Marca";
import { Perfil } from "./Perfil";
import { EntornoMock } from "./EntornoMock";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Marca solo en móvil — en lg vive en el Sidebar */}
        <div className="flex items-center gap-3 lg:hidden">
          <Marca />
        </div>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <EntornoMock />
          <Perfil />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}