# AGENTS.md — Convenciones del proyecto (SIPES MVP frontend)

Este archivo es la fuente única de convenciones del workspace para trabajar con cualquier asistente de IA (opencode, Codex, Gemini CLI, Claude, Copilot, etc.). Léelo completo antes de tocar código. Toda la implementación está dirigida por OpenSpec (`openspec/`); las convenciones de este archivo aplican en todos los cambios.

## Fuentes del proyecto

Los únicos insumos técnicos del MVP viven en `docs/`. Nada más es referencia válida.

| Archivo en `docs/` | Rol |
|---|---|
| `schema_1.prisma` | Modelo de datos en código (fuente de verdad del schema) |
| `SIPES - El modelo de datos.md` | La explicación en palabras del mismo modelo (misma v0.2) |
| `01_constraints_1.sql` | Restricciones críticas que el schema no puede expresar (R-G03, R-G06, R-H12, R-C05, R-I02) |
| `02___Catálogo_de_reglas.md` | Libro de reglas R-*; origen de los identificadores citados en el schema y los specs |
| `SIPES  - Ruta del proyecto y Sprint 1.md` | Roadmap de sprints: define qué es Sprint 1 y qué queda después |
| `contrato-api.md` | Contrato del backend BK2 v2.1 (el consumido por `integracion-bk2`) |
| `Hoja_Pedido_Sublitex.xlsx` | Pedido PROMO 2002: seed de negocio para el simulador (`mocks/`) |

- El catálogo de reglas es la referencia de cada identificador `R-*`: si un spec o tarea cita una regla, la regla se consulta acá.
- El `.prisma` y su `.md` de explicación son EL MISMO modelo: validar contra el `.prisma`, entender con el `.md`.
- Si el `.sql` contradice al `.prisma`, manda el `.sql` (tiene reglas que Prisma no puede expresar).

## Verificación (siempre al terminar una tarea)

Dentro de `sublitex-web/`:

- `npm test` — Vitest: tests de lógica de negocio, adaptador y validación.
- `npm run lint` — ESLint.
- `npm run build` — build de producción de Next.js.

## Estructura de carpetas

La aplicación vive en `sublitex-web/`. Nada de código en la raíz del workspace.

```
sublitex-web/
├─ app/                          # Rutas (App Router de Next.js)
│  ├─ layout.tsx                 # Shell: nav Logo Sublitex SIMS + enlaces
│  ├─ page.tsx                   # Redirección a /pedidos
│  ├─ pedidos/
│  │  ├─ page.tsx                # Lista de pedidos
│  │  └─ [id]/page.tsx           # Detalle (cabecera + grilla + proforma)
│  ├─ catalogos/
│  │  └─ page.tsx                # Productos, tallas, telas, cuellos, acabados
│  └─ api/                       # Puente simulador ↔ backend (contrato BK2)
├─ components/
│  ├─ pedidos/                   # ListaPedidos, FiltroEstado, FilaPedido
│  ├─ detalle/                   # CabeceraPedido, DisenoAprobado, MuestrarioColores, EnvioProvincia
│  ├─ prendas/                   # TablaPrendas, FilaPrenda, EditorPrenda, BarraBom
│  ├─ proforma/                  # ResumenProforma, LineaConcepto
│  ├─ catalogos/                 # TablaCatalogos, ParametrosComerciales
│  └─ ui/                        # Primitivas reutilizables (Badge, Spinner, EmptyState)
├─ domain/                       # Lógica de negocio PURA (sin React, sin fetch, sin estado de UI)
│  ├─ precios.ts                 # R-K10: base + recargos (talla, tela, cuello, acabado)
│  ├─ bom.ts                     # R-K03: piezas físicas por producto
│  ├─ proforma.ts                # Subtotal, recargos, IGV 18%, adelanto 50%, saldo
│  └─ validacion.ts              # Ficha mínima y columna "qué falta"
├─ services/
│  ├─ contrato.ts                # Tipos DTO del contrato BK2 v2.1
│  ├─ adaptador.ts               # ÚNICO lugar que mapea DTO → modelo de presentación
│  └─ http.ts                    # Cliente con validación de respuestas; SIPES_BACKEND_URL
├─ types/                        # Tipos de dominio y de presentación
└─ mocks/                        # Simulador local (forma exacta del contrato) + seed PROMO 2002
```

## Nomenclatura

| Qué | Convención | Ejemplo |
|---|---|---|
| Componente (archivo `.tsx`) | PascalCase, nombre por capacidad + función | `TablaPrendas.tsx`, `CabeceraPedido.tsx` |
| Capa, rutas y carpetas de componentes | kebab-case | `components/detalle-pedido/`, `app/pedidos/[id]` |
| Módulos de dominio/servicios/utilidades | camelCase en `.ts` | `calcularPrecio.ts`, `adaptador.ts` |
| Tests | Mismo nombre + `.test.ts(x)`, co-located | `precios.test.ts`, `TablaPrendas.test.tsx` |
| Estilos | Tailwind 4 inline; CSS Module solo si no alcanza, mismo nombre del componente | `TablaPrendas.module.css` |

## Reglas de capas y negocio

- `domain/` es el corazón: funciones puras, unit-testeadas, sin dependencias de React ni de servicios. Un test por regla de negocio (R-K10, R-K03, R-K02, R-K07).
- El precio SIEMPRE se deriva de tarifas: `base + recargo talla + recargo tela + recargo cuello + recargo acabado`. Nunca un número escrito a mano. Obsequio/muestra → precio `0` (R-K02).
- El adaptador es el único lugar de mapeo DTO → presentación. Nadie accede a campos del contrato (`tallaId`, `numero`, `genero`) fuera de `services/`.
- El dorsal es un texto: `S/N` es válido y los repetidos están permitidos (R-K04).
- Edición de prenda: un único `PATCH /api/prendas/:id` con la ficha mínima (talla, dorsal, género, nombre en prenda) (R-E03). Si falla, el borrador permanece en pantalla.
- Si el backend real está configurado (`SIPES_BACKEND_URL`) y falla, NO degradar a datos de demostración: mostrar error y validar la respuesta contra el contrato antes de pintar.
- La proforma no tiene precios editables salvo el "adelanto recibido" (R-K07).
- Los textos literales de estampado y rotulado de envío se copian, nunca se reescriben a mano.

## Prohibiciones

- No agregar código en la raíz del workspace: todo dentro de `sublitex-web/`.
- No copiar componentes ni lógica del repo anterior `RptSoft-Sublitex`: es un proyecto greenfield.
- No crear seeds JSON a mano fuera de `mocks/`.
- No escribir precios ni totales manualmente; siempre derivar.
- No commitear secretos ni claves.

## Workflow OpenSpec

El trabajo se planifica en `openspec/` (config idiomática `es`). Para dirigir a los asistentes:

| Herramienta | Comandos |
|---|---|
| opencode | `/opsx-propose`, `/opsx-explore`, `/opsx-sync`, `/opsx-update`, `/opsx-apply`, `/opsx-archive` |
| Codex | skills `openspec-*` (empieza con `$openspec-propose`) |
| Gemini CLI | `/opsx:propose`, `/opsx:explore`, `/opsx:sync`, `/opsx:update`, `/opsx:apply`, `/opsx:archive` |

Los artefactos se escriben en español manteniendo los headings estructurales y las palabras SHALL/MUST en inglés. Antes de implementar, todo cambio debe tener `proposal`, `specs`, `design` y `tasks` completos y validados.