# Design

## Context

Workspace greenfield (`sublitex-mvp`) sin código previo ni git. Las capacidades del MVP se definen en `proposal.md` y sus contratos observables en `specs/`. Restricciones de origen: el frontend de oficina debe trabajar contra el contrato BK2 v2.1 antes de que exista el backend, y el pedido PROMO 2002 (28 prendas, 17 kits, 11 camisetas, 62 piezas) es el dato de prueba para toda integración.

## Goals / Non-Goals

**Goals:**
- Una sola estructura de proyecto para las 6 capacidades, con lógica de negocio pura separada de la capa de React (fácil de testear).
- Las pantallas se construyen contra el contrato BK2 desde el día uno mediante un simulador local intercambiable.
- La grilla de prendas distingue heredado de excepción solo por datos (el modelo entrega `excepciones` por prenda), sin estado especial en el frontend.

**Non-Goals:**
- No construir el flujo del participante por enlace, la edición de excepciones vía API, el cierre/confirmación ni el nesting (exclusos del MVP en `proposal.md`).
- No diseñar autenticación real: el alcance de oficina asume rol coordinador, con la restricción de lectura en catálogos declarada a nivel de contrato.

## Decisions

**D1 — Stack Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4, tests con Vitest.**
Porque App Router da rutas al mismo nivel que las capacidades y las rutas `app/api/*` sirven de puente (simulador ↔ backend) sin infraestructura extra. Alternativa considerada: Vite + React Router (más liviano), descartada porque el puente de datos y el SSR no aportan fricción aquí y Next es el estándar del equipo.

**D2 — Capa de contrato (mocks) → adaptador → modelo de presentación.**
La capa de datos habla en términos del contrato BK2 v2.1 (DTO con IDs como `tallaId`, `numero`). Cada pantalla recibe un modelo de presentación tipado (talla, dorsal, género, etc.) y un adaptador traduce DTO → presentación en un solo lugar. Alternativa considerada: consumir DTOs crudos en las pantallas; descartada porque acopla las vistas a nombres de backend que van a cambiar en la integración.

**D3 — Simulador local explícito y configurable (variable de entorno).**
`SIPES_BACKEND_URL` ausente → simulador con la forma exacta del contrato y persistencia local (archivo JSON en el workspace). Configurada → se usa el backend real y un error NO degrada a demostración. Alternativa considerada: detectar fallo y hacer fallback automático; descartada porque oculta errores de integración (regla del proyecto: terminar es contra la API real).

**D4 — Lógica de negocio como funciones puras fuera de los componentes.**
Precios (`base + recargo talla + recargo tela + recargo cuello + recargo acabado`, R-K10), BOM (multiplicar componentes por prenda, R-K03) y validación "qué falta" viven en módulos sin React y con tests por regla. Alternativa considerada: componentes con hooks; descartada por testabilidad y consistencia con la regla de "quien implementa no escribe su test".

**D5 — Herencia vs excepción resuelta por datos, presentada por estilo.**
El valor efectivo se resuelve al leer: excepción de la prenda si existe, si no el valor general del grupo. La presentación marca la celda heredada atenuada y la excepción resaltada (capacidad visual R-C06). No hay persistencia de excepciones en el MVP; solo renderizado.

**D6 — Guardado en un solo envío (PATCH) con preservación de borrador.**
El editor de fila acumula cambios y los envía en un único `PATCH /api/prendas/:id` (talla, número, género, nombreEnPrenda). Si falla, el borrador queda en pantalla. Alternativa considerada: autosave por campo; descartada por el contrato y por evitar PATCH parciales.

## Risks / Trade-offs

- [El contrato BK2 v2.1 puede cambiar durante la integración real] → Mitigación: el adaptador aísla el mapeo en un solo módulo y la validación de respuestas rechaza DTO incompatibles antes de pintarlos.
- [La grilla de 26 columnas es densa en pantallas chicas] → Mitigación: diseño adaptable con columnas esenciales fijas y el resto bajo un panel/detalle lateral por fila.
- [El simulador puede divergir del backend real] → Mitigación: el simulador se congela como "forma del contrato" y la integración final apaga el simulador; la validación de contratos detecta divergencias.
- [Dependencias del stack (Next 16) nuevas para algunos del equipo] → Mitigación: la documentación del workspace (ABIERTA en el repo) cubre el setup y los comandos de verificación.

## Migration Plan

No aplica migración de datos: proyecto greenfield sin producción. El plan de despliegue se reduce a: (1) build y tests en verde, (2) apagar el simulador y conectar `SIPES_BACKEND_URL`, (3) verificar PROMO 2002 contra el backend real.

## Open Questions

Ninguna que bloquee el alcance o la descomposición de tareas para el MVP definido.