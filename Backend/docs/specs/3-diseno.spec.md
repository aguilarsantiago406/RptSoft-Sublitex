# Spec — Módulo `3-diseno`

## Propósito

Versionado y aprobación gráfica del diseño de sublimación: guarda cada versión del archivo de impresión, controla el flujo `BORRADOR → PROPUESTO → APROBADO / RECHAZADO` y congela la versión aprobada (R-H02).

**Sala / Equipo responsable:** BK3 — Diseño, Producción y Auditoría
**Módulos que dependen de este:** `1-nucleo-comercial` (cierre del bloque `DISENO`, pendiente de coordinación), `4-taller-produccion`
**Módulos de los que depende:** `5-auditoria` (`AuditoriaService`), `1-nucleo-comercial` (`Pedido`, `Usuario`)

---

## Entidades

### `Diseno`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | text | PK, NOT NULL, `@default(cuid())` | Generado por backend |
| `pedidoId` | text | NOT NULL, FK → `Pedido.id`, `ON DELETE CASCADE` | Un pedido tiene N versiones |
| `version` | integer | NOT NULL | Auto-incremental por pedido; **contrato crítico** |
| `estado` | enum(`BORRADOR`,`PROPUESTO`,`APROBADO`,`RECHAZADO`) | NOT NULL, `DEFAULT 'BORRADOR'` | Valores exactos — no cambiar |
| `archivoUrl` | text | NULL | Archivo de sublimación |
| `imagenUrl` | text | NULL | Vista previa para el cliente |
| `aprobadoEn` | timestamptz | NULL | Se congela al aprobar; inmutable después |
| `aprobadoPorId` | text | NULL, FK → `Usuario.id` (SOFT: sin constraint) | Trazabilidad del aprobador |
| `creadoEn` | timestamptz | NOT NULL, `DEFAULT now()` | — |

**Índices obligatorios:**
- `Diseno_pedidoId_version_key` UNIQUE ON (`pedidoId`, `version`) — **el `@@unique` que garantiza R-H11**

> Sin `deletedAt` ni `updatedAt`: un diseño no se borra ni se edita su fecha. El historial es append-only por versionado.

**Triggers asociados:**
- `trg_exigir_codigo_de_color` (`BEFORE INSERT OR UPDATE`, función `exigir_codigo_de_color`) — **R-K05**: aborta si el diseño entra a `APROBADO` y el pedido tiene `ColorPedido` sin `codigoHex`.

---

## Endpoints

| Método | Path | Roles | HTTP Success | Notas |
|---|---|---|---|---|
| POST | `/api/disenos` | DISENO, ADMINISTRADOR | 201 | `pedidoId` inexistente → 400; versiona con `siguienteVersion()` |
| PATCH | `/api/disenos/:id/artefactos` | DISENO | 200 | 409 si el diseño está `APROBADO`; 400 si no llega ningún campo |
| PATCH | `/api/disenos/:id/proponer` | DISENO | 200 | 409 si el diseño no está en `BORRADOR` |
| PATCH | `/api/disenos/:id/aprobar` | DISENO, ADMINISTRADOR | 200 | Congela `aprobadoEn`/`aprobadoPorId`; 400 sin `usuarioId` o con usuario inexistente |
| PATCH | `/api/disenos/:id/rechazar` | DISENO | 200 | 409 si no está en `PROPUESTO`; motivo va a auditoría, no al estado |
| GET | `/api/pedidos/:pedidoId/disenos` | todos | 200 | Historial, `orderBy version desc`, incluye `aprobadoPor`; pedido inexistente → 400 |
| GET | `/api/disenos/:id` | todos | 200 | Detalle con `aprobadoPor`; inexistente → 404 |

**Endpoints prohibidos (no deben existir):**
- `DELETE /api/disenos/:id` — el historial de versiones no se borra; una corrección se resuelve creando una versión nueva (`version + 1`).
- `PATCH /api/disenos/:id` genérico — obligaría a aceptar `estado` libre y saltaría la máquina de estados.
- `PUT /api/disenos/:id/version/:n` — nada sobrescribe una versión existente.
- `PATCH /api/disenos/:id/rechazar` con motivo dentro del estado — produce strings como `"RECHAZADO (color malo)"` que rompen el enum en la BD y las consultas por estado.

---

## DTOs

### `CrearDisenoDto`
```typescript
{
  pedidoId: string   // @IsString() @IsNotEmpty() — debe existir en Pedido
  archivoUrl?: string // @IsOptional() @IsString()
  imagenUrl?: string  // @IsOptional() @IsString()
}
```

### `ActualizarArtefactosDto`
```typescript
{
  archivoUrl?: string // @IsOptional() @IsString()
  imagenUrl?: string  // @IsOptional() @IsString()
}
```
Al menos uno debe venir: si no llega ninguno → `400 BadRequestException`.

### `EstadoDisenoDto`
```typescript
{
  usuarioId?: string  // @IsOptional() @IsString() — obligatorio en `aprobar`
  motivo?: string     // @IsOptional() @IsString() — usado en `rechazar`
}
```

### `DisenoResponseDto` (respuesta implícita de Prisma + `aprobadoPor`)
```typescript
{
  id: string
  pedidoId: string
  version: number
  estado: EstadoDiseno
  archivoUrl: string | null
  imagenUrl: string | null
  aprobadoEn: Date | null
  aprobadoPorId: string | null
  creadoEn: Date
  aprobadoPor: Usuario | null   // contrato con 4-taller-produccion y 1-nucleo-comercial
}
```

---

## Reglas de Negocio

### Restricciones absolutas (nunca cambiar)
- SIEMPRE versionar por pedido: `version = (máxima version del pedido) + 1`. Nunca sobrescribir una versión existente.
- SIEMPRE escribir el cambio de estado y su registro de `RegistroCambio` dentro del **mismo `$transaction`** → si se ignora, un estado puede quedar cambiado sin traza y R-I01 se vuelve indemostrable.
- NUNCA mezclar el motivo de rechazo en el string del estado → el enum `EstadoDiseno` no lo admite y las consultas por `estado` fallan.
- NUNCA permitir reemplazar `archivoUrl`/`imagenUrl` de un diseño `APROBADO` → un diseño aprobado es un contrato congelado con el cliente; se crea una versión nueva.
- NUNCA reimplementar R-K05 en TypeScript → el trigger `trg_exigir_codigo_de_color` ya aborta el `APROBADO` si falta un `codigoHex`. Duplicar la validación da dos fuentes de verdad.
- SI el usuario aprobador no existe → `400`: se registra la aprobación de un actor inexistente y R-I04 queda sin atribución real.
- SI un pedido tiene colores sin `codigoHex` al aprobar → error de trigger de Postgres, no de validación de DTO.

### Máquina de estados
```
BORRADOR ──► PROPUESTO ──► APROBADO (TERMINAL)
                │
                └──► RECHAZADO ──► (retrabajo en una versión nueva)

BORRADOR / PROPUESTO / RECHAZADO ──► (artefactos reemplazables)
APROBADO ──► (artefactos congelados)
```

| Estado actual | Transiciones permitidas |
|---|---|
| `BORRADOR` | `PROPUESTO` |
| `PROPUESTO` | `APROBADO`, `RECHAZADO` |
| `APROBADO` | *(ninguno — terminal)* |
| `RECHAZADO` | *(ninguno por estado; el retrabajo crea una versión nueva)* |

`RECHAZADO` es terminal como estado: no vuelve a `PROPUESTO`. Corregir un rechazo es crear `version + 1` en `BORRADOR`.

### Race conditions (si aplica)
- Dos `POST /api/disenos` simultáneos sobre el mismo pedido: ambos calculan la misma `version` → violación de `Diseno_pedidoId_version_key`. Proteger con el unique constraint; responder `409 Conflict` (Prisma `P2002`).
- `siguienteVersion()` se lee **fuera** de la transacción: el `@@unique` es la red de seguridad real, no el `findFirst`.

---

## Contratos que Expone

> Estos campos/endpoints son garantías para otros módulos. **No cambiar sin coordinar.**

| Campo / Endpoint | Consumidor | Tipo | Garantía |
|---|---|---|---|
| `Diseno.estado = 'APROBADO'` | `1-nucleo-comercial` | `EstadoDiseno` | Es la condición que habilita cerrar el bloque `DISENO` (R-H02) |
| `Diseno.pedidoId` | `5-auditoria` | text | Permite auditar el diseño dentro del historial del pedido |
| `Diseno.archivoUrl` | `4-taller-produccion` | `string` | Ruta del archivo de sublimación que se imprime |
| `GET /api/pedidos/:pedidoId/disenos` | Frontend, `1-nucleo-comercial` | GET | Historial completo, orden descendente por versión |
| `aprobadoEn` / `aprobadoPor` | Frontend, auditoría | `Date` / `Usuario` | Quién aprobó y cuándo — congelado, nunca se recalcula |
| `@@unique([pedidoId, version])` | `4-taller-produccion` | constraint | Garantiza que una versión identificada no se duplica |

---

## Contratos que Consume

> Estos campos/endpoints son dependencias de otros módulos. Si cambian, este módulo falla.

| Campo / Endpoint | Proveedor | Tipo esperado | Riesgo si cambia |
|---|---|---|---|
| `Pedido.id` | `1-nucleo-comercial` | text (cuid) | `crear` y `listarPorPedido` devuelven 400 en vez de rechazar; no hay forma de validar el pedido |
| `Usuario.id`, `Usuario.rol` | `1-nucleo-comercial` | text, `RolUsuario` | `aprobar` no puede congelar el aprobador ni atribuir `autorRol`; R-I04 se degrada a "origen USUARIO sin rol" |
| `RolUsuario` (enum) | `1-nucleo-comercial` | enum con 6 valores | Si se renombra o agrega un valor, el `switch` de atribución en `editarConAuditoria` deja de compilar |
| `ColorPedido.codigoHex` | `1-nucleo-comercial` | `string \| null`, `^#[0-9A-F]{6}$` | R-K05 se desactiva: se aprueban diseños con colores ambiguos ("verde", "azul oscuro") |
| `AuditoriaService.registrar` | `5-auditoria` | `(input, tx?) => Promise<void>` | Sin `tx` el cambio de estado y su traza dejan de ser atómicos; R-I01 se rompe |
| `RegistroCambio.pedidoId` (FK NOT NULL) | `5-auditoria` / schema | text | Es la razón de que este módulo no pueda auditar entidades que no pertenecen a un pedido |

**Protocolo de bloqueo:** Si falta un contrato crítico externo, detener implementación y emitir issue con: endpoint esperado, shape requerido, impacto.

---

## Seguridad y Auditoría

- `aprobar` y `rechazar` son los únicos puntos donde el rol importa. `aprobar` exige `usuarioId` explícito y lo persiste en `aprobadoPorId`; `rechazar` acepta `usuarioId` pero hoy no lo atribuye (pendiente).
- `archivoUrl` e `imagenUrl` son rutas de almacenamiento: no son PHI, pero tampoco son públicas. No registrarlos en logs de aplicación más allá de la auditoría (que es el registro oficial).
- Acciones registradas en `RegistroCambio` (R-I01): `creacion`, `archivoUrl`, `imagenUrl`, `estado` (de `proponer`/`aprobar`/`rechazar`), `motivoRechazo`.
- Solo los **cambios de valor real** se auditan: `actualizarArtefactos` compara contra el valor previo y omite el registro si la URL es idéntica → evita ruido en el historial.
- `origen: 'USUARIO'` en todas las operaciones de este módulo. `PARTICIPANTE` no aplica: los participantes no accedieron por enlace firmado (R-D05).
- **Ningún rol puede borrar un diseño** — no existe el endpoint y la tabla no tiene `deletedAt`.
- ⚠️ **Pendiente de coordinación:** `JwtAuthGuard` no existe en el repo. Los endpoints de este módulo no llevan autenticación; la matriz de roles es hoy declarativa.

---

## Migración — no aplica

No hubo migración de datos. `Diseno` ya existía en `schema.prisma` v0.2 + bloque K y BK3 no modificó el schema ni `constraints.sql`.

Lo que sí cambió desde el esqueleto (código, no esquema):
- `actualizarArtefactos` y `rechazar` pasaron a ser transaccionales (antes el `UPDATE` salía de la transacción).
- El motivo de rechazo pasó de estar embebido en el string del estado a ser el campo de auditoría `motivoRechazo`.

---

## Tareas de Implementación

- [x] `DisenoService.crear` con `siguienteVersion(pedidoId)` y auditoría `creacion` dentro de `$transaction`
- [x] `DisenoService.actualizarArtefactos` con bloqueo de estados `APROBADO` y auditoría solo del diff real
- [x] `DisenoService.proponer` con validación de estado origen `BORRADOR`
- [x] `DisenoService.aprobar` con validación de `usuarioId`, existencia del usuario, congelado de `aprobadoEn`/`aprobadoPorId` y atribución de `autorRol`
- [x] `DisenoService.rechazar` con motivo como campo de auditoría separado
- [x] `DisenoService.listarPorPedido` (validación de pedido + `include aprobadoPor`)
- [x] `DisenoService.obtenerDetalle` con `NotFoundException`
- [x] `DisenoController` con `@ApiTags('Diseños')` y `@ApiOperation` en los 7 endpoints
- [x] DTOs `CrearDisenoDto`, `ActualizarArtefactosDto`, `EstadoDisenoDto` con `class-validator`
- [x] `DisenoModule` importando `AuditoriaModule`; `DominioDisenoModule` reexportando
- [x] Test: `proponer` transiciona `BORRADOR → PROPUESTO` y audita dentro de la transacción
- [x] Test: `proponer` rechaza un diseño que no está en `BORRADOR`
- [x] Test: `proponer` lanza `NotFound` si el diseño no existe
- [x] Test: `aprobar` exige `usuarioId`
- [x] Test: `aprobar` rechaza un diseño que no está en `PROPUESTO`
- [x] Test: `aprobar` congela `aprobadoEn`/`aprobadoPorId` y atribuye el rol al registro
- [x] Test: `rechazar` audita estado limpio y motivo como campo separado (no en el string)
- [x] Test: `actualizarArtefactos` rechaza reemplazar artefactos de un diseño `APROBADO`
- [x] Test: `actualizarArtefactos` reemplaza y audita el diff en la misma transacción
- [x] Test: `actualizarArtefactos` no audita campos que no cambiaron
- [ ] **Pendiente BK1:** cerrar el bloque `DISENO` del pedido al aprobar (R-H02) — `BloquePedido` es territorio BK1
- [ ] **Pendiente:** aplicar `JwtAuthGuard` cuando exista la pieza de autenticación
- [ ] **Pendiente:** atribuir `autorUsuarioId` en `rechazar` (hoy se acepta pero se ignora)
- [ ] Test e2e: el trigger `trg_exigir_codigo_de_color` aborta el `APROBADO` con un `ColorPedido` sin `codigoHex` (requiere PostgreSQL real)
