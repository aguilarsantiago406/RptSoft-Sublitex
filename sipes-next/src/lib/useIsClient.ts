"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook seguro para SSR en React 19 y Next.js.
 * Retorna true únicamente en el cliente sin causar advertencias de renderizado en cascada (set-state-in-effect).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
