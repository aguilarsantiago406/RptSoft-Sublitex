"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import styles from "./clientes.module.css";

interface ClientesFiltrosProps {
  busquedaActual?: string;
  tipoActual?: string;
}

export function ClientesFiltros({
  busquedaActual = "",
  tipoActual = "",
}: ClientesFiltrosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateQuery(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set(name, value.trim());
    } else {
      params.delete(name);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={styles.filtersBar}>
      <div className={styles.searchWrapper}>
        <Search size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar organización o cliente..."
          defaultValue={busquedaActual}
          onChange={(e) => updateQuery("q", e.target.value)}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.filterLabel} htmlFor="tipo-filter">
          Tipo:
        </label>
        <select
          id="tipo-filter"
          className={styles.filterSelect}
          value={tipoActual}
          onChange={(e) => updateQuery("tipo", e.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="PROMOCION">Promoción escolar</option>
          <option value="COLEGIO">Colegio</option>
          <option value="CLUB">Club deportivo</option>
          <option value="EMPRESA">Empresa</option>
          <option value="PARTICULAR">Particular</option>
        </select>
      </div>
    </div>
  );
}
