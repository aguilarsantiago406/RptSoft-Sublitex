# Auditoría de código — `sublitex-web`

**Proyecto**: Sublitex (frontend `sublitex-web`, Next.js App Router)
**Fecha**: 2026-09
**Alcance**: todo `src/` (componentes, hooks, dominio, servicios/mocks, rutas API, tipos, config)
**Estado**: solo lectura — informe de auditoría, sin modificaciones de código

---

## A. Estructura de proyecto

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| A1 | Metadata por defecto "Create Next App" | `src/app/layout.tsx:15-18` | Título y metadata genéricos de Next, nada de Sublitex | Completar `export const metadata` con título/nombre, lenguaje `es-PE` | MEJORA |
| A2 | Grilla gigante con estilos inline repetidos | `src/components/prendas/TablaPrendas.tsx` (original 494 líneas) | Celdas con `style={{ padding: "4px 8px", border: "1px solid #eee" }}` repetido ±100 veces; todo el JSX en un solo componente | ~~Extraer sub-componentes de celda/select/input + CSS module o constantes de estilo~~ → **CERRADO**: Split en 4 unidades (`TablaPrendas.tsx` orquestador 77 lns, `FilaPrenda.tsx` 250 lns, `TotalesPrendas.tsx` 34 lns, `CeldaEditable.tsx` 64 lns) + `TablaPrendas.module.css` para centralizar estilos sin duplicación inline. `tsc=0`, `vitest=12/12`. | ✔ COMPLETADO |
| A3 | Nombrado de servicios inconsistente | `src/services/*Mock.ts` — `catalogoMock.ts` (singular) vs `tarifasMock.ts` vs `grupoPrendasMock.ts` | Mezcla singular/plural sin patrón claro | Unificar convención (`*Mock.ts` consistente, alineado al recurso) | MEJORA |

## B. Dominio y reglas de negocio

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| B1 | **Validación de prenda NO es data-driven** | `src/domain/validacionPrenda.ts` | Hardcodeaba `CUELLO` / `TELA` / `CORTE` como obligatorios e **ignoraba el flag `obligatorio`** que el catálogo ya declara. El contrato R-B06 exige que la validación salga del catálogo | ~~Reconstruir `validarPrenda` para recorrer `catalogo.atributos` y usar `a.obligatorio`~~ → **CERRADO**: `validarPrenda` recorre `catalogo.atributos` y evalúa `atributo.obligatorio` (R-B06). Cubierto con tests unitarios. | ✔ COMPLETADO |
| B2 | Sin suite de tests | `package.json`, 0 archivos `.test/.spec` | La lógica pura de negocio no tenía cobertura | ~~Añadir vitest + tests de dominio~~ → **CERRADO**: vitest@3.2.7 + suite `src/domain/calculoPrecios.test.ts` (12 tests verdes cubriendo precios, totales, piezas y validación). | ✔ COMPLETADO |

## C. API routes y manejo de errores

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| C1 | `GET /api/pedidos/:id` no valida el id | `src/app/api/pedidos/[id]/route.ts` | Devuelve `pedidoDetalleMock` para **cualquier** id; nunca produce el 404 `NOT_FOUND` del contrato §1.3 (existe `noEncontrado` en `_errores.ts` pero no se usa) | Validar `id` contra el mock (igual que hace `prendas/[id]`) y responder `noEncontrado("pedido", id)` | IMPORTANTE |
| C2 | `GET /api/grupos/[id]/prendas` valida pero devuelve grilla completa | `src/app/api/grupos/[id]/prendas/route.ts:17-21` | Correcto que valide 404, pero devuelve la grilla entera sin paginar/filtrar; aceptable como mock | Documentar que el contrato §5.1 queda como está (grupo completo) | MEJORA |
| C3 | Buen patrón de errores centralizado | `src/app/api/_errores.ts` (`errorApi`, `noEncontrado`) | ✔ Cumple contrato §1.3 (shape `{codigo, mensaje[, detalle]}`) | Cero acción — es el ejemplo a replicar | ✔ |

## D. Hooks y data-fetching

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| D1 | La página de detalle solo usa `grupos[0]` | `src/app/pedidos/[id]/page.tsx:29` y `usePedidoDetalle` | Solo se edita el primer grupo de config; si un pedido tiene varios grupos, el resto no es alcanzable en la UI | Iterar/selector de grupos (contrato §3.3 `grupos[]`); al menos señalarlo explícitamente como pendiente | IMPORTANTE |
| D2 | `useGrupoPrendas` depende de `grupo.configuracion` + guard `montado` | `src/hooks/useGrupoPrendas.ts:159` | El `useEffect` depende de `[grupoId, configuracion]` y el guard `montado` evita re-fetch al actualizar; frágil si la config cambia y se quiere recargar | Aclarar intención del guard; confirmar que editar no recarga (como ya se decidió) | MEJORA |

## E. Rendimiento

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| E1 | Totales con `useMemo` correcto | `src/components/prendas/TablaPrendas.tsx` (vía `calcularTotales`) | ✔ Cálculo en una pasada y memoizado por `[prendas, tarifas, catalogo]` | ✔ | ✔ |

## F. TypeScript / buenas prácticas

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| F1 | Uso de `any`/casteo en el fetch | `src/hooks/usePedidoDetalle.ts`, `useGrupoPrendas.ts` (`.then((data) => ...)`) | Los tipos de API se declaran pero la respuesta se castea sin validación de runtime; riesgo de contrato roto en silencio | `unknown` + guardas de tipo si la superficie crece | MEJORA |
| F2 | Sin `console.log` / `TODO` / `@ts-ignore` en `src/` | grep completo | ✔ Código limpio (solo comentarios de contrato §) | ✔ | ✔ |

## G. Testing — hallazgo transversal

| # | Hallazgo | Ubicación | Problema | Solución | Prioridad |
|---|----------|-----------|----------|----------|-----------|
| G1 | Sin suite de tests | `package.json` (sin jest/vitest/playwright/cypress), 0 archivos `.test`/`.spec` | La lógica de negocio pura (precios, totales, piezas, validación) no tiene cobertura; cualquier cambio en tarifas/reglas puede romper precios sin detectarse | ~~Añadir vitest + tests de dominio sobre los casos del contrato~~ → **CERRADO**: vitest@3.2.7 + `src/domain/calculoPrecios.test.ts` (12 tests verdes, data-driven sobre catálogo/tarifas reales) + script `"test": "vitest run"` + `vitest.config.ts` (alias `@→./src`) | ✔ COMPLETADO |

---

## Resumen ejecutivo — 5 acciones más urgentes

1. **[CRÍTICO]** ~~Hacer `validacionPrenda` data-driven desde el catálogo — usar el flag `obligatorio` que el catálogo ya trae, en lugar de hardcodear CUELLO/TELA/CORTE. Contrato R-B06: el catálogo es la fuente de verdad única para atributos. — `src/domain/validacionPrenda.ts`~~ → **COMPLETADA**: `validarPrenda` recorre `catalogo.atributos` dinámicamente evaluando `a.obligatorio` (R-B06). Probado con 12 tests en vitest.
2. **[IMPORTANTE]** ~~Añadir suite mínima de tests de dominio (vitest) — cubrir precios, totales, piezas y validación con los casos del contrato. Hoy hay **0** cobertura sobre el cálculo de precios.~~ → **COMPLETADA**: `vitest@^3` (devDependency) + `vitest.config.ts` (alias `@→./src`) + script `"test": "vitest run"` + suite única `src/domain/calculoPrecios.test.ts` con **12 tests verdes** sobre `tarifaActiva`/`calcularPrecio` (R-K10/R-K02), `calcularPrecio`/`totalPiezas` (R-K03), `calcularTotales` (R-E07/R-E08) y `validarPrenda` data-driven (R-B06). `tsc --noEmit` = 0 errores en el mismo árbol. — `package.json`
3. **[IMPORTANTE]** ~~Validar el `id` en `GET /api/pedidos/:id` y responder el 404 `noEncontrado` del contrato §1.3, igual que ya hace `prendas/[id]`.~~ → **YA RESUELTA en el código real** (como #1): `src\app\api\pedidos\[id]\route.ts` ya devuelve `noEncontrado("pedido", id)` cuando `id !== pedidoDetalleMock.id`. Falso positivo del borrador por espejo de árbol. — `src/app/api/pedidos/[id]/route.ts`
4. **[IMPORTANTE] Decidir explícitamente el alcance de múltiples grupos** — la UI solo edita `grupos[0]`; confirmar si los demás grupos quedan fuera del alcance actual o se itera. — `src/app/pedidos/[id]/page.tsx:29`
5. **[MEJORA] Personalizar metadata + refactor de `TablaPrendas`**:
   - ~~Refactor de `TablaPrendas`~~ → **COMPLETADA**: Split en 4 unidades (`TablaPrendas.tsx` 77 lns, `FilaPrenda.tsx` 250 lns, `TotalesPrendas.tsx` 34 lns, `CeldaEditable.tsx` 64 lns) y estilos extraídos a `TablaPrendas.module.css`. `tsc=0`, `vitest=12/12`.
   - Pendiente: Quitar "Create Next App" (`src/app/layout.tsx:15`).
