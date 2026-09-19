"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [abiertoMovil, setAbiertoMovil] = useState(false);

  const enlaces = [
    {
      href: "/pedidos",
      etiqueta: "Pedidos de Confección",
      descripcion: "Bandeja y seguimiento de pedidos",
      activo: pathname.startsWith("/pedidos"),
    },
    {
      href: "/catalogos",
      etiqueta: "Catálogos y Tarifas",
      descripcion: "Tallas, telas, cuellos y recargos",
      activo: pathname.startsWith("/catalogos"),
    },
  ];

  return (
    <>
      {/* Barra superior solo para móviles */}
      <div className="flex h-14 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
        <Link href="/pedidos" className="text-base font-bold tracking-tight text-zinc-900">
          Sublitex <span className="text-red-600">SIMS</span>
        </Link>
        <button
          type="button"
          onClick={() => setAbiertoMovil(!abiertoMovil)}
          className="rounded-md border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50"
          aria-label="Abrir menú"
        >
          {abiertoMovil ? "✕" : "☰"}
        </button>
      </div>

      {/* Backdrop móvil */}
      {abiertoMovil && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setAbiertoMovil(false)}
        />
      )}

      {/* Sidebar fijo a la izquierda */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          abiertoMovil ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Cabecera / Identidad */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-100 px-5">
          <Link href="/pedidos" className="flex flex-col" onClick={() => setAbiertoMovil(false)}>
            <span className="text-base font-black tracking-tight text-zinc-900">
              Sublitex <span className="text-red-600">SIMS</span>
            </span>
            <span className="text-[11px] font-medium text-zinc-400">
              SIPES · Taller y Confección
            </span>
          </Link>
        </div>

        {/* Enlaces de Navegación Principal */}
        <nav className="flex flex-1 flex-col gap-1.5 p-3" aria-label="Navegación principal">
          <span className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Operaciones
          </span>

          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              onClick={() => setAbiertoMovil(false)}
              className={`flex flex-col rounded-lg px-3.5 py-2.5 transition-colors ${
                enlace.activo
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <span className="text-sm font-semibold">{enlace.etiqueta}</span>
              <span
                className={`text-xs ${
                  enlace.activo ? "text-zinc-300" : "text-zinc-500"
                }`}
              >
                {enlace.descripcion}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer del Sidebar: Estado del Sistema */}
        <div className="border-t border-zinc-100 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 border border-zinc-200 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-zinc-800">Sprint 1 MVP</span>
              <span className="truncate text-[11px] text-zinc-500">
                PROMO 2002 · Seed Activo
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
