# Spec — Módulo `4-taller-produccion`

## Propósito

Nesting, corte y archivos de impresión: reparte el consumo real de tela entre pedidos (R-K11, R-K15), registra los TIF exportados por el taller (R-K13) y calcula el costo de impresión desde la tarifa vigente (R-K14, R-K10).

**Sala / Equipo responsable:** BK3 — Diseño, Producción y Auditoría
**Módulos que dependen de este:** Frontend de producción, `1-nucleo-comercial` (costo de impresión de un pedido)
**Módulos de los que depende:** `5-auditoria` (`AuditoriaService`), `1-nucleo-comercial` (`Pedido`, `Usuario`, `ValorAtributo`, `Tarifa`), `3-diseno` (`Diseno.archivoUrl` como artefacto a imprimir)

---

## Entidades

### `Nesting`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | text | PK, NOT NULL, `@default(cuid())` | Generado por backend |
| `codigo` | text | NOT NULL, **UNIQUE** | Código legible, ej. `NEST-2002-01`; único en todo el sistema |
| `telaId` | text | NOT NULL, FK → `ValorAtributo.id` | Valor de atributo del catálogo de telas |
| `anchoImpresionM` | decimal(4,2) | NOT NULL, `DEFAULT 1.80` | **R-K12**: el ancho de impresión es fijo, 1.80 m. Lo que varía es el largo. No lo edites |
| `fecha` | timestamptz | NOT NULL, `DEFAULT now()` | Orden del listado |
| `creadoPorId` | text | NOT NULL, FK → `Usuario.id` | Quién planificó el nesting |
| `creadoPor` | `Usuario` | relación `NestingCreador` | — |

**Índices obligatorios:**
- `Nesting_codigo_key` UNIQUE ON (`codigo`)

> Sin `deletedAt` ni `updatedAt`: un nesting ejecutado no se borra. Sin embargo, no hay `onDelete` en `Nesting` para `ValorAtributo` ni `Usuario` → borrar una tela que tenga nestings falla por FK.

### `NestingParte`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | text | PK, NOT NULL, `@default(cuid())` | Generado por backend |
| `nestingId` | text | NOT NULL, FK → `Nesting.id`, `ON DELETE CASCADE` | HARD: el nesting es dueño de sus partes |
| `pedidoId` | text | NOT NULL, FK → `Pedido.id` | **R-K11**: a qué pedido se le carga esta parte. Es lo que permite repartir el consumo |
| `numeroParte` | integer | NOT NULL | Auto-incremental dentro del nesting |
| `anchoCm` | integer | NOT NULL | Ancho **realmente ocupado**, no el del rollo. La diferencia contra 180 cm es desperdicio lateral |
| `largoCm` | integer | NOT NULL | Largo ocupado en cm; de aquí sale el consumo |
| `esRib` | boolean | NOT NULL, `DEFAULT false` | El rib se mide y se reporta aparte de la tela principal |

**Índices obligatorios:**
- `NestingParte_nestingId_numeroParte_key` UNIQUE ON (`nestingId`, `numeroParte`)
- `NestingParte_pedidoId_idx` ON (`pedidoId`) — **índice que sostiene R-K15**: el consumo siempre filtra por pedido

### `ArchivoTif`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | text | PK, NOT NULL, `@default(cuid())` | Generado por backend |
| `nestingId` | text | NOT NULL, FK → `Nesting.id`, `ON DELETE CASCADE` | HARD |
| `nombre` | text | NOT NULL, **UNIQUE** | Formato `SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif` |
| `largoM` | decimal(6,2) | NOT NULL | Largo del archivo en metros; **R-K13**: un archivo de más de 5 m es inmanejable por peso |
| `ordenEnSerie` | integer | NOT NULL | Posición en la serie, ≥ 1 |
| `totalSerie` | integer | NOT NULL | Total de piezas de la serie, ≥ 1 |
| `entregadoEn` | timestamptz | NULL | Fecha de entrega al taller |

**Índices obligatorios:**
- `ArchivoTif_nombre_key` UNIQUE ON (`nombre`)

---

## Endpoints

| Método | Path | Roles | HTTP Success | Notas |
|---|---|---|---|---|
| POST | `/api/nestings` | PRODUCCION, ADMINISTRADOR | 201 | Valida tela y usuario; `codigo` duplicado → 409 |
| GET | `/api/nestings` | PRODUCCION, todos | 200 | `orderBy fecha desc`; incluye `tela`, `archivos` y `_count.partes` |
| GET | `/api/nestings/:id` | PRODUCCION, todos | 200 | Detalle con `partes` (por `numeroParte`) y `archivos` (por `ordenEnSerie`); inexistente → 404 |
| POST | `/api/nestings/:id/partes` | PRODUCCION | 201 | **R-K11**: exige `pedidoId`; `numeroParte` auto-incremental; audita contra el pedido de la parte |
| POST | `/api/nestings/:id/archivos` | PRODUCCION | 201 | **R-K13**: `ordenEnSerie`/`totalSerie` forman la serie del TIF; nombre duplicado → 409 |
| GET | `/api/consumo-tela/pedido/:pedidoId` | PRODUCCION, todos | 200 | **R-K15 + R-K14 + R-K10**; pedido inexistente → 400 |

**Endpoints prohibidos (no deben existir):**
- `DELETE /api/nestings/:id/partes/:parteId` — el consumo ya cobrado no se puede borrar sin recalcular el costo del pedido. Corrección = nueva parte.
- `GET /api/consumo-tela/nesting/:nestingId` — **consecuencia:** cargan el costo total del nesting a un solo pedido, que es exactamente el error que R-K15 existe para impedir. En un nesting real se imprimieron 1497 cm de un pedido y 116 cm de otro.
- `PATCH /api/nestings/:id/anchoImpresionM` — R-K12 fija el ancho en 1.80 m. Si varía, el nombre de los TIF (`180x_...`) deja de describir el archivo.
- `POST /api/nestings` con `costo` o `precioPorMetro` en el body — R-K10: ningún precio se escribe a mano.
- `PATCH /api/nestings/:id/codigo` sin revalidar unicidad — dos operarios archivan el mismo rollo con códigos distintos y el consumo se duplica al contarlo dos veces.

---

## DTOs

### `CrearNestingDto`
```typescript
{
  codigo: string       // @IsString() @IsNotEmpty() — ej. 'NEST-2002-01', único en el sistema
  telaId: string       // @IsString() @IsNotEmpty() — debe existir en ValorAtributo
  creadoPorId: string  // @IsString() @IsNotEmpty() — debe existir en Usuario
}
```

### `CrearNestingParteDto`
```typescript
{
  pedidoId: string   // @IsString() @IsNotEmpty() — R-K11: sin esto el consumo no se puede repartir
  anchoCm: number    // @IsInt() @Min(1) @Max(180) — 1..180, el ancho de impresión es 1.80 m (R-K12)
  largoCm: number    // @IsInt() @Min(1) — largo realmente ocupado
  esRib?: boolean    // @IsOptional() @IsBoolean() — default false; el rib se reporta aparte
}
```

### `CrearArchivoTifDto`
```typescript
{
  nombre: string      // @IsString() @IsNotEmpty() — SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif
  largoM: number      // @IsNumber() @Min(0.01) — R-K13: > 0
  ordenEnSerie: number // @IsInt() @Min(1)
  totalSerie: number   // @IsInt() @Min(1)
  entregadoEn?: string // @IsOptional() @IsDateString() — ISO 8601
}
```

### `ConsumoTelaResponseDto`
```typescript
{
  pedidoId: string
  pedidoCodigo: string
  partes: number              // cuántas partes del pedido hay en todos los nestings
  metrosTela: number          // 2 decimales, solo partes con esRib = false
  metrosRib: number           // 2 decimales, solo partes con esRib = true
  metrosLineales: number      // metrosTela + metrosRib
  anchoMaximoUsadoCm: number | null   // null si el pedido no tiene partes
  precioPorMetro: number | null       // null si no hay tarifa vigente (R-K10)
  costoImpresion: number | null       // null si no hay tarifa vigente (R-K10)
  nota?: string                        // presente solo cuando precioPorMetro es null
}
```

---

## Reglas de Negocio

### Restricciones absolutas (nunca cambiar)
- SIEMPRE asignar una parte a un pedido (`pedidoId` es NOT NULL) → si se omite, el consumo no se puede repartir y el costo se pierde.
- SIEMPRE calcular el consumo de un pedido sumando **sus partes**, nunca el total del nesting → R-K15. Un nesting mezcla pedidos en la misma tela: 1497 cm de un pedido y 116 cm de otro. Cargar el total infla un pedido y deja al otro en cero.
- SIEMPRE obtener el precio desde `Tarifa` con `tipo = 'COSTO_INTERNO'`, `activo = true` y `vigenteHasta = null`, filtrando `concepto` por `impresi` (case-insensitive), ordenada por `vigenteDesde desc` → R-K10 + R-K14.
- NUNCA escribir un precio a mano ni devolver `0` como sustituto de "sin tarifa" → si no hay tarifa, `costoImpresion: null` con `nota` explicando por qué. Un `0` se confunde con "impresión gratis".
- NUNCA auditar `Nesting` ni `ArchivoTif` contra un `pedidoId` inventado → `RegistroCambio.pedidoId` es FK NOT NULL y estas entidades **no pertenecen a un solo pedido**. Solo `NestingParte` se audita, y se atribuye al `pedidoId` de la parte.
- SIEMPRE separar rib de tela en el reporte de consumo → el rib es un material distinto y su precio puede diferir.
- SIEMPRE reportar `anchoMaximoUsadoCm` → mide qué tan bien se nestaa el diseño (desperdicio lateral contra 180 cm).
- SIEMPRE redondear a 2 decimales (`Number(valor.toFixed(2))`) antes de devolver metros y costo.

### Máquina de estados

No aplica. `Nesting`, `NestingParte` y `ArchivoTif` no tienen campo de estado. El flujo real es:

```
Nesting (creado)
   ├──► NestingParte #1, #2, ... N   (agregadas a medida que se imprime)
   └──► ArchivoTif 1deM, 2deM, ...   (serie exportada al taller, R-K13)
```

Un nesting no se "cierra" en el sistema: se considera ejecutado cuando todos sus `ArchivoTif` tienen `entregadoEn`. Esa condición **no está implementada todavía**.

### Race conditions (si aplica)
- Dos `POST /api/nestings/:id/partes` simultáneos calculan el mismo `numeroParte = última + 1` → violación de `NestingParte_nestingId_numeroParte_key`. Proteger con el unique constraint; responder `409 Conflict` (Prisma `P2002`).
- `agregarArchivo` con el mismo `nombre` en dos peticiones → violación de `ArchivoTif_nombre_key` → `409`.
- `agregarParte` lee la última parte **fuera** de la transacción: el `@@unique` es la red de seguridad real, no el `findFirst`.
- `agregarArchivo` **no** está dentro de una transacción con auditoría (no audita hoy); si se le agrega auditoría, debe atarse a `$transaction` para no romper R-I01.

---

## Contratos que Expone

> Estos campos/endpoints son garantías para otros módulos. **No cambiar sin coordinar.**

| Campo / Endpoint | Consumidor | Tipo | Garantía |
|---|---|---|---|
| `GET /api/consumo-tela/pedido/:pedidoId` | `1-nucleo-comercial`, Frontend | GET | Consumo ya repartido por pedido (R-K15) — el consumidor **no debe** recalcularlo desde `Nesting` |
| `costoImpresion: null` | `1-nucleo-comercial` | `number \| null` | `null` significa "sin tarifa vigente", **nunca** "costo cero" |
| `nota: string` | Frontend | `string` | Solo presente cuando `precioPorMetro` es null; explica el R-K10 aplicado |
| `NestingParte.anchoCm` | Reportes de desperdicio | `integer` 1..180 | Ancho realmente ocupado, no el ancho del rollo |
| `NestingParte.esRib` | `1-nucleo-comercial` | `boolean` | Permite separar materiales en el costo |
| `ArchivoTif.ordenEnSerie` / `totalSerie` | Taller, Frontend | `integer` | Define la serie; `ordenEnSerie ≤ totalSerie` siempre |
| `Nesting.codigo` | Operarios, Frontend | `string` UNIQUE | Identificador legible del rollo; único en el sistema |
| `Nesting.anchoImpresionM` (fijo 1.80) | Generación de TIF | `decimal(4,2)` | R-K12: el ancho nunca varía, solo el largo |

---

## Contratos que Consume

> Estos campos/endpoints son dependencias de otros módulos. Si cambian, este módulo falla.

| Campo / Endpoint | Proveedor | Tipo esperado | Riesgo si cambia |
|---|---|---|---|
| `Pedido.id`, `Pedido.codigo` | `1-nucleo-comercial` | text | `agregarParte` y `consumoPorPedido` devuelven 400; el nesting queda sin reparto de consumo |
| `Usuario.id` | `1-nucleo-comercial` | text | `crear` rechaza el nesting con 400; nadie puede planificar producción |
| `ValorAtributo.id` (catálogo TELA) | `1-nucleo-comercial` | text | `crear` rechaza la tela con 400; no hay nesting posible |
| `Tarifa` (`COSTO_INTERNO`, concepto ~ "impresi") | `1-nucleo-comercial` | `Decimal` + `vigenteDesde`/`vigenteHasta` | `precioPorMetro` y `costoImpresion` pasan a `null`: **la impresión se deja de facturar en silencio** hasta que BK1 cargue la tarifa |
| `Tarifa_vigente_una_por_concepto` (unique index) | `1-nucleo-comercial` / schema | constraint | Con dos tarifas vigentes, `findFirst` elige una al azar y el costo se vuelve no determinista |
| `Diseno.archivoUrl` | `3-diseno` | `string` | Si el diseño aprobado cambia de ruta, los TIF ya exportados apuntan a un archivo que ya no es el aprobado |
| `AuditoriaService.registrar` | `5-auditoria` | `(input, tx?) => Promise<void>` | Sin `tx`, la parte y su traza dejan de ser atómicas; R-I01 se rompe |
| `RegistroCambio.pedidoId` (FK NOT NULL) | `5-auditoria` / schema | text | Es la razón por la que solo `NestingParte` se audita (tiene pedido) y `Nesting`/`ArchivoTif` no |

**Protocolo de bloqueo:** Si falta un contrato crítico externo, detener implementación y emitir issue con: endpoint esperado, shape requerido, impacto.

---

## Seguridad y Auditoría

- `crear`, `agregarParte` y `agregarArchivo` son escrituras de taller: requieren rol `PRODUCCION` o `ADMINISTRADOR`. `listar`, `detalle` y `consumo` son de lectura y admiten cualquier usuario autenticado.
- `entregadoEn` es un dato de fecha de taller, no PHI. `largoM`, `anchoCm` y `esRib` son medidas de producción, no datos de personas.
- Acciones registradas en `RegistroCambio` (R-I01): **solo** la creación de `NestingParte`, con `campo: 'creacion'` y un `valorNuevo` descriptivo (`"{codigo} #{n} rib 160x400cm"`). La creación del `Nesting` y de los `ArchivoTif` **no se auditan** — ver migración.
- **Por qué `Nesting` y `ArchivoTif` no se auditan:** `RegistroCambio.pedidoId` es FK NOT NULL y un nesting puede mezclar varios pedidos (R-K11). No existe un `pedidoId` honesto que atribuirle. Forzar uno sería fabricar trazabilidad falsa. **Pendiente de coordinación con BK1: revisar el modelo.**
- `origen: 'USUARIO'` en la auditoría de partes. `autorUsuarioId` no se setea hoy (el servicio es el que conoce al operario, no este módulo).
- **Ningún rol puede borrar** un nesting, una parte ni un archivo TIF — no existen endpoints de borrado.
- ⚠️ **Pendiente de coordinación:** `JwtAuthGuard` no existe en el repo. Los endpoints de este módulo no llevan autenticación.

---

## Migración — esqueleto → implementado

- DEBES asignar `pedidoId` a toda `NestingParte` creada a partir de ahora (R-K11) — es NOT NULL en el modelo, así que no hay datos huérfanos posibles.
- SI un nesting existente tiene partes sin `pedidoId` (no posible con el modelo actual, pero verificable) → la creación de nuevas partes para ese nesting fallará; asignar el pedido correctivo antes de continuar.
- NUNCA calcular consumo de tela sumando los totales de `Nesting` → consecuencia: el costo de un pedido queda inflado y el de otro en cero (el error histórico de R-K15).
- NUNCA devolver `costoImpresion: 0` cuando falta la tarifa → consecuencia: un pedido con impresión real aparece como si fuera gratis.

---

## Tareas de Implementación

- [x] `NestingService.crear` validando existencia de tela (`ValorAtributo`) y usuario
- [x] `NestingService.listar` con `tela`, `archivos` y `_count.partes`
- [x] `NestingService.obtenerDetalle` con `partes` y `archivos` ordenados, `NotFoundException`
- [x] `NestingService.agregarParte` con `numeroParte` auto-incremental y validación de nesting/pedido (R-K11)
- [x] `NestingService.agregarParte` auditando contra el pedido de la parte dentro de `$transaction`
- [x] `NestingService.agregarArchivo` con la serie de TIF (R-K13)
- [x] `NestingService.consumoPorPedido` sumando **solo** las partes del pedido y separando tela/rib (R-K15)
- [x] `NestingService.consumoPorPedido` reportando `anchoMaximoUsadoCm`
- [x] `NestingService.consumoPorPedido` calculando costo = metros lineales × tarifa vigente (R-K14)
- [x] `NestingService.consumoPorPedido` devolviendo `null` + `nota` cuando no hay tarifa (R-K10)
- [x] `redondear()` a 2 decimales en metros y costo
- [x] `NestingController` con `@ApiTags('Producción')` y `@ApiOperation` en los 6 endpoints
- [x] DTOs `CrearNestingDto`, `CrearNestingParteDto`, `CrearArchivoTifDto` con `class-validator` y rangos
- [x] `NestingModule` importando `AuditoriaModule`; `TallerProduccionModule` reexportando
- [x] Test: `crear` valida tela y usuario
- [x] Test: `crear` rechaza si la tela no existe
- [x] Test: `agregarParte` asigna el número siguiente y audita contra el pedido de la parte
- [x] Test: `agregarParte` lanza `NotFound` si el nesting no existe
- [x] Test: `agregarParte` lanza `BadRequest` si el pedido no existe (R-K11 asigna la parte)
- [x] Test: `consumoPorPedido` suma solo las partes del pedido, separa tela y rib, y calcula el costo (R-K14/R-K15)
- [x] Test: `consumoPorPedido` devuelve costo `null` y nota si no hay tarifa vigente (R-K10)
- [x] Test: `consumoPorPedido` lanza `BadRequest` si el pedido no existe
- [ ] **Pendiente BK1:** resolver la auditoría de `Nesting` y `ArchivoTif` (hace falta `pedidoId` nullable o una tabla puente)
- [ ] **Pendiente:** transaccionalizar `agregarArchivo` y `crear` en cuanto se definan sus registros de auditoría
- [ ] **Pendiente:** validar `ordenEnSerie ≤ totalSerie` y que la serie esté completa antes de entregar al taller
- [ ] **Pendiente:** aplicar `JwtAuthGuard` cuando exista la pieza de autenticación
- [ ] **Pendiente:** setear `autorUsuarioId` en la auditoría de `NestingParte`
- [ ] Test e2e: dos `POST /partes` concurrentes sobre el mismo nesting → una recibe `409` por `NestingParte_nestingId_numeroParte_key`
