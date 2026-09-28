# Spec — Módulo `5-auditoria`

## Propósito

Trazabilidad inmutable de todo cambio del pedido: expone `AuditoriaService` como servicio transversal de R-I01 y una consulta de solo lectura sobre `RegistroCambio` (R-I02, R-I04, R-I05). No tiene lógica de negocio propia: es la infraestructura de auditoría de BK1, BK2 y BK3.

**Sala / Equipo responsable:** BK3 — Diseño, Producción y Auditoría
**Módulos que dependen de este:** TODOS — `3-diseno`, `4-taller-produccion`, `1-nucleo-comercial` (pendiente), `2-operacion-prendas` (pendiente)
**Módulos de los que depende:** ninguno (solo `core/prisma`)

---

## Entidades

### `RegistroCambio`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | text | PK, NOT NULL, `@default(cuid())` | Generado por backend |
| `pedidoId` | text | NOT NULL, FK → `Pedido.id` | **R-I01 se indexa por pedido.** Sin `ON DELETE` declarado → borrar el pedido con registros falla por FK |
| `entidad` | text | NOT NULL | Qué se tocó: `"Diseno"`, `"NestingParte"`, `"Prenda"`, `"Participante"`, `"ValorConfiguracion"`… (texto libre, no enum) |
| `entidadId` | text | NOT NULL | Id de la entidad afectada |
| `campo` | text | NOT NULL | Campo modificado, o `"creacion"` para altas |
| `valorAnterior` | text | NULL | `null` en altas; también se usa para "vaciar" un campo |
| `valorNuevo` | text | NULL | `null` en bajas; **R-I01 no obliga a que uno de los dos sea NOT NULL** |
| `origen` | enum(`USUARIO`,`PARTICIPANTE`,`SISTEMA`,`GHL`) | NOT NULL | **R-I04** · Un cambio del participante se atribuye al participante, nunca al coordinador que le pasó el enlace |
| `autorUsuarioId` | text | NULL, FK → `Usuario.id` (SOFT: sin constraint) | Actor interno |
| `autorParticipanteId` | text | NULL | **No es FK dura a propósito** (R-D08): el registro sobrevive si el participante se elimina |
| `autorRol` | enum(`ADMINISTRADOR`,`COORDINADOR_OPERATIVO`,`VENDEDORA`,`COORDINADOR_CLIENTE`,`DISENO`,`PRODUCCION`) | NULL | Rol en el momento del cambio; congelado, no se recalcula |
| `prendasAfectadas` | integer | NULL | **R-I05** · Los cambios de configuración general registran a cuántas prendas afectaron EN ESE MOMENTO. El número de hoy no sirve para explicar ayer |
| `creadoEn` | timestamptz | NOT NULL, `DEFAULT now()` | R-I02 append-only: por diseño **no tiene `updatedAt`** |

**Índices obligatorios:**
- `RegistroCambio_pedidoId_creadoEn_idx` ON (`pedidoId`, `creadoEn`) — sostiene el historial del pedido ordenado
- `RegistroCambio_entidad_entidadId_idx` ON (`entidad`, `entidadId`) — "todos los cambios de esta fila"
- `RegistroCambio_autorUsuarioId_idx` ON (`autorUsuarioId`) — R-I06: alertas de un usuario, calculadas

**Permisos a nivel de base de datos (`constraints.sql`):**
```sql
REVOKE UPDATE, DELETE ON "RegistroCambio" FROM PUBLIC;
-- GRANT SELECT, INSERT ON "RegistroCambio" TO sipes_app;  -- descomentar al ajustar el rol real
```
> R-I02 se implementa **quitando el permiso**, no confiando en que nadie escriba el `UPDATE`. El servicio no expone `update` ni `delete` — es la segunda capa, no la única.

> Sin `deletedAt`: soft delete es imposible por diseño. Un registro de auditoría no se borra, ni por API ni por SQL.

---

## Endpoints

| Método | Path | Roles | HTTP Success | Notas |
|---|---|---|---|---|
| GET | `/api/registros-cambio` | ADMINISTRADOR, COORDINADOR_OPERATIVO | 200 | Filtros `pedidoId`, `entidad`, `entidadId`, `origen`, `limit`; incluye `autorUsuario` |

**Endpoints prohibidos (no deben existir):**
- `POST /api/registros-cambio` — la auditoría se escribe **desde el servicio que hace el cambio**, dentro de la misma transacción. Un endpoint público permitiría registrar cambios que no ocurrieron.
- `PATCH /api/registros-cambio/:id` — contradice R-I02. Además, la BD lo revoca: `42501 permission denied`.
- `DELETE /api/registros-cambio/:id` — idéntico. No hay borrado para ningún rol, ni por API.
- `PUT /api/registros-cambio/:id` — no existe edición de historial, ni para `ADMINISTRADOR`.
- `GET /api/registros-cambio/:id` — la granularidad útil es por pedido, entidad o autor; un registro suelto siempre está en alguno de esos filtros.
- `GET /api/registros-cambio` sin paginación obligatoria — el historial de un pedido grande no cabe en una respuesta. `limit` está acotado a 1000.

---

## DTOs

### `ListarRegistrosCambioDto`
```typescript
{
  pedidoId?: string      // @IsOptional() @IsString() — R-I01: el historial es por pedido
  entidad?: string       // @IsOptional() @IsString() — 'Diseno' | 'NestingParte' | 'Prenda' | ...
  entidadId?: string     // @IsOptional() @IsString()
  origen?: OrigenCambio  // @IsOptional() @IsEnum(OrigenCambio) — R-I04
  limit?: number         // @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(1000) — default 100
}
```

### `RegistroCambioInput` (interfaz interna, no DTO HTTP)
```typescript
{
  pedidoId: string        // obligatorio — R-I01. Impide auditar entidades sin pedido
  entidad: string
  entidadId: string
  campo: string
  valorAnterior?: string | null   // ?? null
  valorNuevo?: string | null      // ?? null
  origen: 'USUARIO' | 'PARTICIPANTE' | 'SISTEMA' | 'GHL'
  autorUsuarioId?: string         // ?? null
  autorRol?: RolUsuario           // ?? null
}
```

### `RegistroCambioResponseDto`
```typescript
{
  id: string
  pedidoId: string
  entidad: string
  entidadId: string
  campo: string
  valorAnterior: string | null
  valorNuevo: string | null
  origen: OrigenCambio
  autorUsuarioId: string | null
  autorParticipanteId: string | null
  autorRol: RolUsuario | null      // congelado en el momento del cambio
  prendasAfectadas: number | null  // R-I05, congelado en el momento del cambio
  creadoEn: Date
  autorUsuario: {                   // proyección: nunca el usuario completo
    id: string
    nombre: string
    email: string
    rol: RolUsuario
  } | null
}
```

---

## Reglas de Negocio

### Restricciones absolutas (nunca cambiar)
- SIEMPRE llamar `registrar(data, tx)` pasando el `TransactionClient` de la operación que describe → sin `tx`, el cambio y su traza son dos escrituras independientes y un fallo intermedio deja un cambio sin auditar. **R-I01 no se cumple.**
- NUNCA exponer `update` ni `delete` en `AuditoriaService` → R-I02. La ausencia de los métodos es la garantía legible en el código; el `REVOKE` es la garantía real.
- NUNCA inventar un `pedidoId` para auditar una entidad que no pertenece a un pedido (caso `Nesting` y `ArchivoTif`, R-K11) → fabricar atribución es peor que no auditar. Detener y escalar.
- NUNCA recalcular `prendasAfectadas` ni `autorRol` en el momento de la lectura → **R-I05**: el número de prendas de hoy no explica lo que pasó ayer.
- SIEMPRE atribuir el cambio al actor real según `origen` → R-I04: un cambio hecho por un participante se atribuye al `PARTICIPANTE`, nunca al coordinador que le pasó el enlace.
- SIEMPRE usar `campo: 'creacion'` para altas, en vez de inventar un par `valorAnterior`/`valorNuevo` vacío.
- SIEMPRE acotar `limit` (1..1000) → un historial sin paginación no es servible ni auditable.

### Máquina de estados

No aplica. `RegistroCambio` es append-only: no tiene estado ni transiciones. Su único ciclo es **insertar** y **leer**.

```
[operación de negocio]
      └──► $transaction
             ├──► UPDATE/INSERT en la entidad
             └──► INSERT en RegistroCambio   ← mismo tx, atómico
                    │
                    └──► solo SELECT lo puede leer
```

### Race conditions (si aplica)
- Dos cambios concurrentes sobre la misma entidad generan dos registros: **no hay colisión**, es el comportamiento correcto. El orden real lo establece `creadoEn`; dos inserts dentro del mismo milisegundo pueden salir en orden no determinista en el `orderBy`.
- Mitigación: dentro de la misma transacción, dos escrituras sobre la misma fila se serializan por el lock de fila de PostgreSQL → no se pierde ninguna.
- `registrar()` sin `tx` desde dos operaciones concurrentes: no hay conflicto, pero **sí una ventana** donde el cambio queda aplicado sin traza. Es el riesgo real de este módulo.

---

## Contratos que Expone

> Estos campos/endpoints son garantías para otros módulos. **No cambiar sin coordinar.**

| Campo / Endpoint | Consumidor | Tipo | Garantía |
|---|---|---|---|
| `AuditoriaService.registrar(data, tx?)` | **Todos** los módulos | método | Punto único de escritura de R-I01. Su firma no debe cambiar sin refactorizar a todos los llamadores |
| `registrar()` acepta `tx?: Prisma.TransactionClient` | `3-diseno`, `4-taller-produccion` | parámetro opcional | Permite auditoría atómica. **Quitar el parámetro rompe R-I01 en todos los módulos** |
| `RegistroCambio.entidad` como texto libre | `3-diseno`, `4-taller-produccion` | `string` | `"Diseno"`, `"NestingParte"` — sin constraint, para que un módulo nuevo no requiera migración |
| `RegistroCambio.campo` como texto libre | todos | `string` | `"creacion"`, `"estado"`, `"archivoUrl"`, `"motivoRechazo"`… |
| `GET /api/registros-cambio?pedidoId=` | Frontend, auditorías internas | GET | Historial del pedido, `creadoEn desc`, `take` por defecto 100 |
| `autorRol` congelado | Frontend, R-I06 | `RolUsuario \| null` | El rol tal como era al ocurrir el cambio, no el rol actual del usuario |
| `prendasAfectadas` congelado | Frontend, R-I05 | `number \| null` | Cuántas prendas había en ese momento, no cuántas hay hoy |
| `Pedido.id` como FK NOT NULL | `4-taller-produccion` | constraint | Obliga a que toda entidad auditada pertenezca a un pedido (y de ahí el bloqueo con `Nesting`) |
| `REVOKE UPDATE, DELETE` | Base de datos | permiso | R-I02 a nivel motor, no a nivel aplicación |

---

## Contratos que Consume

> Estos campos/endpoints son dependencias de otros módulos. Si cambian, este módulo falla.

| Campo / Endpoint | Proveedor | Tipo esperado | Riesgo si cambia |
|---|---|---|---|
| `Pedido.id` (FK NOT NULL) | `1-nucleo-comercial` | text | **Riesgo alto:** si `Pedido` se hace soft-delete, los `RegistroCambio` quedan apuntando a un pedido que la API devuelve 404 → el historial es ilegible justo cuando más se necesita. Coordinar antes de cambiar la política de borrado de pedidos |
| `Usuario.id`, `Usuario.nombre`, `Usuario.email`, `Usuario.rol` | `1-nucleo-comercial` | text / text / text / `RolUsuario` | `listar()` deja de proyectar `autorUsuario`; el historial dice quién cambió algo pero no quién |
| `OrigenCambio` (enum) | `1-nucleo-comercial` | enum de 4 valores | Si se agrega un valor, `RegistroCambioInput.origen` y el filtro `@IsEnum` lo aceptan, pero ningún módulo lo emite → origen muerto |
| `RolUsuario` (enum) | `1-nucleo-comercial` | enum de 6 valores | `autorRol` queda con un valor que el frontend no sabe pintar |
| `PrismaService` | `core/prisma` | `@Global()` | Si deja de ser global, `AuditoriaModule` debe importar `PrismaModule` explícitamente |
| `Participante.id` (no es FK) | `2-operacion-prendas` | text | R-D08 depende de que `autorParticipanteId` **no** sea FK: si se agrega, borrar un participante rompe el historial |

**Protocolo de bloqueo:** Si falta un contrato crítico externo, detener implementación y emitir issue con: endpoint esperado, shape requerido, impacto.

---

## Seguridad y Auditoría

- **Este módulo ES la auditoría.** La regla de seguridad es: nada entra aquí que no describa un cambio real.
- Acceso de lectura: restringido a `ADMINISTRADOR` y `COORDINADOR_OPERATIVO` por diseño. Un `VENDEDORA` no necesita el historial técnico; un `DISENO`/`PRODUCCION` sí necesita el suyo, pero debe filtrar por su propio `pedidoId`/rol, no ver el de todos.
- ⚠️ **Pendiente:** `GET /api/registros-cambio` **no tiene `@UseGuards(JwtAuthGuard)`** porque el guard no existe en el repo. Mientras tanto, cualquiera que alcance el endpoint lee el historial completo de todos los pedidos. **Es la brecha de seguridad más urgente de BK3.**
- **PHI — el historial mezcla datos personales.** `entidad: "Prenda"` o `"Participante"` arrastra `valorAnterior`/`valorNuevo` con nombre, número y talla de personas. El módulo no debe loguear estos valores a la consola del servidor: el `RegistroCambio` **es** el almacén, y duplicarlo en logs rompe el control de acceso de la consulta.
- `valorAnterior` y `valorNuevo` son `text`: no hay validación de longitud. Un valor mayor a ~2700 bytes trunca la lectura en la UI. Si un valor es largo, guardar un resumen o un hash, no el documento completo.
- Acciones registradas: **esta es la tabla**, no se registra en sí misma (sería recursivo e infinito).
- `autorParticipanteId` no es FK dura (R-D08) a propósito — no "arreglar" eso como si fuera un descuido.
- R-I06 (alertas de cambios masivos) está marcada en `constraints.sql` como *"no garantizable en la BD: necesita tests"* y se calcula sobre estos registros; **no está implementada.**

---

## Migración — esqueleto → implementado

- DEBES auditar **dentro de la transacción** del cambio → si una operación existente llama `registrar()` sin `tx`, hay que pasárselo; si no, R-I01 se rompe silenciosamente.
- NUNCA reescribir registros existentes para "normalizar" el `origen` o el `autorRol` → R-I02 no admite actualización. Si hay datos incorrectos, la corrección es un registro nuevo que explique el anterior.
- SI falta `pedidoId` para una entidad que hay que auditar → consecuencia observable: la escritura falla con violation de FK y **no se puede registrar el cambio**. Parar y escalar; nunca usar un `pedidoId` aproximado.
- SI se agrega un valor a `OrigenCambio` o `RolUsuario` → los registros históricos conservan el valor con el que se escribieron; el enum es la única fuente de interpretación. La transición de un valor viejo requiere una decisión explícita de BK1.

---

## Tareas de Implementación

- [x] `RegistroCambioInput` como interfaz de entrada (no DTO HTTP): separa el contrato interno del externo
- [x] `AuditoriaService.registrar(data, tx?)` con `tx?: Prisma.TransactionClient` para auditoría atómica
- [x] Normalización de `valorAnterior`/`valorNuevo`/`autorUsuarioId`/`autorRol` a `null` con `??`
- [x] `AuditoriaService.listar(query)` solo lectura, con filtros opcionales aplicados uno a uno
- [x] `listar()` con `orderBy { creadoEn: 'desc' }` y `take: query.limit ?? 100`
- [x] `listar()` proyectando solo `id`, `nombre`, `email`, `rol` de `autorUsuario` (nunca el usuario completo)
- [x] `ListarRegistrosCambioDto` con `@IsEnum(OrigenCambio)`, `@Type(() => Number)` y rango 1..1000
- [x] `AuditoriaController` con `@ApiTags('Auditoría')` y `@ApiOperation` en `GET /api/registros-cambio`
- [x] `AuditoriaModule` exportando el servicio; `DominioAuditoriaModule` reexportando
- [x] Consumir `AuditoriaService` desde `3-diseno` (crear, proponer, aprobar, rechazar, actualizarArtefactos)
- [x] Consumir `AuditoriaService` desde `4-taller-produccion` (agregarParte)
- [x] Test: `registrar` guarda origen y autor nulos por defecto
- [x] Test: `registrar` audita dentro de una transacción cuando se pasa `tx` (R-I01 atómico)
- [x] Test: `listar` filtra por pedido y entidad con `take` por defecto
- [x] Test: `listar` respeta el límite enviado y el filtro de origen
- [x] Test: el servicio es append-only, no expone `update` ni `delete` (R-I02)
- [ ] **Urgente:** proteger `GET /api/registros-cambio` con `JwtAuthGuard` + matriz de roles cuando exista la pieza de autenticación
- [ ] **Urgente:** definir la política de exposición de PHI — quién lee el historial de un pedido que no es suyo
- [ ] **Pendiente BK1:** resolver la auditoría de `Nesting` y `ArchivoTif` (no tienen un solo `pedidoId`) — hacer `pedidoId` nullable o agregar una tabla puente
- [ ] **Pendiente BK1:** decidir qué pasa con los `RegistroCambio` de un pedido que se hace soft-delete
- [ ] **Pendiente:** implementar `autorParticipanteId` y `prendasAfectadas` (R-I04 rama participante, R-I05) — los campos existen, ningún módulo los escribe
- [ ] **Pendiente:** implementar R-I06 (alertas de cambios masivos) como cálculo sobre estos registros
- [ ] **Pendiente:** paginación por cursor (`creadoEn` + `id`) en vez de solo `limit`
- [ ] Test e2e: `UPDATE` y `DELETE` sobre `RegistroCambio` fallan con `42501` por el `REVOKE` de `constraints.sql`
