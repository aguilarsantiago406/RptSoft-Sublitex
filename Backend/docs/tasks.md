# Tasks — SIPES Backend

> Plan de trabajo del frente **BK3 (Diseño · Producción · Auditoría)**.
> Specs de referencia: [`specs/3-diseno.spec.md`](specs/3-diseno.spec.md) ·
> [`specs/4-taller-produccion.spec.md`](specs/4-taller-produccion.spec.md) ·
> [`specs/5-auditoria.spec.md`](specs/5-auditoria.spec.md)
> Reglas de negocio: `prisma/schema.prisma` + `prisma/constraints.sql`.

**Leyenda:** `[x]` implementado y verificado · `[ ]` pendiente · **`[BK1]`** requiere coordinación con Núcleo comercial.

---

## Grafo de Dependencias

```
Task 1 (5-auditoria · AuditoriaService transversal)
   └──► Task 2 (3-diseno · Versionado y aprobación de diseño)
   └──► Task 3 (4-taller-produccion · Nesting, corte y TIF)
              └──► Task 4 (Consumo de tela y costo de impresión)
                         └──► Task 5 (Cierre del bloque DISENO)   [BK1]

Task 6 (Autenticación · JwtAuthGuard)            — sin dependencias, transversal
Task 7 (Auditoría de entidades sin pedido) [BK1] — depende de Task 1, decisión de BK1
Task 8 (E2E de triggers SQL)                    — depende de Task 2 y Task 3
```

**Orden de ejecución:** Task 1 primero porque **los dos módulos siguientes lo importan** (`DisenoModule` y `NestingModule` declaran `AuditoriaModule` en sus `imports`). Sin Task 1, la aplicación no arranca.

---

## Task 1: `5-auditoria` — Trazabilidad inmutable

**Spec:** [`specs/5-auditoria.spec.md`](specs/5-auditoria.spec.md) · **Implementado:** ✅ completo (23 tests verdes con Task 2 y 3)

- [x] 1.1 Declarar `RegistroCambioInput` como interfaz interna, no DTO HTTP (separa el contrato de escritura del de lectura)
- [x] 1.2 Implementar `registrar(data, tx?: Prisma.TransactionClient)` con `tx` opcional — **R-I01 atómico**
- [x] 1.3 Normalizar a `null` con `??` los campos opcionales: `valorAnterior`, `valorNuevo`, `autorUsuarioId`, `autorRol`
- [x] 1.4 Implementar `listar(query)` solo lectura con filtros opcionales aplicados uno a uno: `pedidoId`, `entidad`, `entidadId`, `origen`
- [x] 1.5 `listar()` con `orderBy { creadoEn: 'desc' }` y `take: query.limit ?? 100`
- [x] 1.6 Proyectar `autorUsuario` con solo `id`, `nombre`, `email`, `rol` — nunca el usuario completo
- [x] 1.7 `ListarRegistrosCambioDto` con `@IsEnum(OrigenCambio)`, `@Type(() => Number)` y rango 1..1000
- [x] 1.8 `AuditoriaController` con `@ApiTags('Auditoría')` en `GET /api/registros-cambio`
- [x] 1.9 `AuditoriaModule` exportando el servicio + `DominioAuditoriaModule` reexportando
- [x] 1.10 **No exponer** `update` ni `delete` — R-I02 (la BD lo refuerza con `REVOKE`)
- [x] 1.11 Test: `registrar` guarda origen y autor nulos por defecto
- [x] 1.12 Test: `registrar` audita dentro de la transacción cuando se pasa `tx` — R-I01
- [x] 1.13 Test: `listar` filtra por pedido y entidad con `take` por defecto
- [x] 1.14 Test: `listar` respeta el límite enviado y el filtro de origen
- [x] 1.15 Test: el servicio es append-only, no expone `update` ni `delete` — R-I02
- [ ] 1.16 **`[BK1]`** Resolver `RegistroCambio.pedidoId` para entidades que no pertenecen a un pedido (`Nesting`, `ArchivoTif`) — hacer nullable o tabla puente
- [ ] 1.17 **`[BK1]`** Decidir qué ocurre con los `RegistroCambio` de un pedido que pasa a soft-delete
- [ ] 1.18 Implementar `autorParticipanteId` y `prendasAfectadas` — los campos existen, ningún módulo los escribe (R-I04 rama participante, R-I05)
- [ ] 1.19 Implementar R-I06 (alertas de cambios masivos) como cálculo sobre estos registros
- [ ] 1.20 Paginación por cursor (`creadoEn` + `id`) en vez de solo `limit`

---

## Task 2: `3-diseno` — Versionado y aprobación gráfica

**Spec:** [`specs/3-diseno.spec.md`](specs/3-diseno.spec.md) · **Implementado:** ✅ completo
**Consume:** Task 1, `Pedido` y `Usuario` de BK1 · **Habilita:** Task 5

- [x] 2.1 `crear` con `siguienteVersion(pedidoId)` y auditoría `creacion` dentro de `$transaction`
- [x] 2.2 `crear` con `BadRequestException` si el pedido no existe
- [x] 2.3 `actualizarArtefactos` con bloqueo de estados no editables (`APROBADO` → 409)
- [x] 2.4 `actualizarArtefactos` con `BadRequestException` si no llega `archivoUrl` ni `imagenUrl`
- [x] 2.5 `actualizarArtefactos` auditando **solo el diff real** (omitir campos idénticos evita ruido en el historial)
- [x] 2.6 `proponer` validando que el diseño esté en `BORRADOR` → si no, 409
- [x] 2.7 `aprobar` exigiendo `usuarioId` y validando que el usuario exista
- [x] 2.8 `aprobar` congelando `aprobadoEn` y `aprobadoPorId`, y atribuyendo `autorRol`
- [x] 2.9 `rechazar` con motivo como campo de auditoría `motivoRechazo` — **nunca dentro del string del estado**
- [x] 2.10 `editarConAuditoria()` transaccional reutilizado por `proponer` y `aprobar`
- [x] 2.11 `listarPorPedido` con `orderBy version desc`, `include aprobadoPor` y validación del pedido
- [x] 2.12 `obtenerDetalle` con `NotFoundException`
- [x] 2.13 `DisenoController` con `@ApiTags('Diseños')` y `@ApiOperation` en los 7 endpoints
- [x] 2.14 DTOs `CrearDisenoDto`, `ActualizarArtefactosDto`, `EstadoDisenoDto` con `class-validator`
- [x] 2.15 `DisenoModule` importando `AuditoriaModule` + `DominioDisenoModule` reexportando
- [x] 2.16 Test: `proponer` transiciona `BORRADOR → PROPUESTO` y audita dentro de la transacción
- [x] 2.17 Test: `proponer` rechaza un diseño fuera de `BORRADOR` y lanza `NotFound` si no existe
- [x] 2.18 Test: `aprobar` exige `usuarioId` y rechaza un diseño fuera de `PROPUESTO`
- [x] 2.19 Test: `aprobar` congela `aprobadoEn`/`aprobadoPorId` y atribuye el rol al registro
- [x] 2.20 Test: `rechazar` audita estado limpio y motivo como campo separado
- [x] 2.21 Test: `actualizarArtefactos` rechaza un diseño `APROBADO`, reemplaza y audita el diff, y no audita lo que no cambió
- [ ] 2.22 Atribuir `autorUsuarioId` en `rechazar` — hoy se acepta el campo y se ignora
- [ ] 2.23 Verificar que el `@@unique([pedidoId, version])` devuelve `409` en dos `POST /api/disenos` concurrentes

---

## Task 3: `4-taller-produccion` — Nesting y archivos TIF

**Spec:** [`specs/4-taller-produccion.spec.md`](specs/4-taller-produccion.spec.md) · **Implementado:** ✅ completo
**Consume:** Task 1, `Pedido` / `Usuario` / `ValorAtributo` de BK1 · **Habilita:** Task 4

- [x] 3.1 `crear` validando existencia de tela (`ValorAtributo`) y de usuario
- [x] 3.2 `listar` con `tela`, `archivos` y `_count.partes`, ordenado por `fecha desc`
- [x] 3.3 `obtenerDetalle` con `partes` (por `numeroParte`) y `archivos` (por `ordenEnSerie`), `NotFoundException`
- [x] 3.4 `agregarParte` con `numeroParte` auto-incremental dentro del nesting
- [x] 3.5 `agregarParte` exigiendo `pedidoId` y validando el pedido — **R-K11**
- [x] 3.6 `agregarParte` auditando contra el pedido de la parte dentro de `$transaction` — R-I01
- [x] 3.7 `agregarArchivo` registrando la serie del TIF — **R-K13**
- [x] 3.8 `NestingController` con `@ApiTags('Producción')` y `@ApiOperation` en los 6 endpoints
- [x] 3.9 DTOs `CrearNestingDto`, `CrearNestingParteDto`, `CrearArchivoTifDto` con `class-validator` y rangos (`anchoCm` 1..180)
- [x] 3.10 `NestingModule` importando `AuditoriaModule` + `TallerProduccionModule` reexportando
- [x] 3.11 Test: `crear` valida tela y usuario, y rechaza si la tela no existe
- [x] 3.12 Test: `agregarParte` asigna el número siguiente y audita contra el pedido de la parte
- [x] 3.13 Test: `agregarParte` lanza `NotFound` si el nesting no existe y `BadRequest` si el pedido no existe
- [x] 3.14 Test: `agregarArchivo` respeta `ordenEnSerie`/`totalSerie` como enteros ≥ 1
- [ ] 3.15 Transaccionalizar `crear` y `agregarArchivo` en cuanto se definan sus registros de auditoría
- [ ] 3.16 Setear `autorUsuarioId` en la auditoría de `NestingParte` (el operario lo conoce el frontend, no el servicio)
- [ ] 3.17 Validar `ordenEnSerie ≤ totalSerie` y que la serie esté completa antes de marcar entregado

---

## Task 4: Consumo de tela y costo de impresión

**Spec:** [`specs/4-taller-produccion.spec.md`](specs/4-taller-produccion.spec.md) · **Implementado:** ✅ completo
**Depende:** Task 3 · **Consume:** `Tarifa` de BK1

- [x] 4.1 `consumoPorPedido` sumando **solo** las partes del pedido — **R-K15** (nunca el total del nesting)
- [x] 4.2 Separar `metrosTela` y `metrosRib` según `esRib`
- [x] 4.3 Calcular `metrosLineales` y redondear a 2 decimales
- [x] 4.4 Reportar `anchoMaximoUsadoCm` (mide el desperdicio lateral contra 180 cm)
- [x] 4.5 Obtener `precioPorMetro` de `Tarifa` (`COSTO_INTERNO`, `activo`, `vigenteHasta = null`, concepto ~ `impresi`, `vigenteDesde desc`) — **R-K14 + R-K10**
- [x] 4.6 Calcular `costoImpresion = metrosLineales × precioPorMetro`
- [x] 4.7 Devolver `costoImpresion: null` + `nota` cuando no hay tarifa vigente — **nunca `0` como sustituto**
- [x] 4.8 `redondear()` a 2 decimales en metros y costo
- [x] 4.9 `GET /api/consumo-tela/pedido/:pedidoId` documentado con su regla en el `@ApiOperation`
- [x] 4.10 Test: suma solo las partes del pedido, separa tela y rib, y calcula el costo — R-K15 / R-K14
- [x] 4.11 Test: devuelve costo `null` y nota si no hay tarifa vigente — R-K10
- [x] 4.12 Test: lanza `BadRequest` si el pedido no existe
- [ ] 4.13 **`[BK1]`** Verificar que exista una `Tarifa` `COSTO_INTERNO` de impresión cargada y vigente; sin ella el costo es `null` y la impresión no se factura
- [ ] 4.14 Test: dos nestings distintos con partes del mismo pedido → el consumo suma ambas, no toma el total de ninguno

---

## Task 5: Cierre del bloque `DISENO` — `[BK1]`

**Spec:** [`specs/3-diseno.spec.md`](specs/3-diseno.spec.md) · **Implementado:** ❌ pendiente · **Depende:** Task 2

- [ ] 5.1 **`[BK1]`** Cerrar `BloquePedido` de tipo `DISENO` cuando exista un `Diseno` en `APROBADO` — **R-H02**: no se cierra Diseño sin un diseño aprobado
- [ ] 5.2 **`[BK1]`** Congelar una `VersionBloque` inmutable al cerrar — R-H01 / R-H14
- [ ] 5.3 **`[BK1]`** Registrar el cambio en `BloquePedido` vía `AuditoriaService.registrar(data, tx)` (Task 1)
- [ ] 5.4 **`[BK1]`** Emitir la confirmación con los totales calculados, nunca escritos a mano — R-H07 / R-H08
- [ ] 5.5 Test: cerrar el bloque `DISENO` sin ningún diseño `APROBADO` → rechazado
- [ ] 5.6 Test: al cerrar, la versión congelada no admite cambios posteriores

> `BloquePedido` y `VersionBloque` son territorio BK1. BK3 no los toca.

---

## Task 6: Autenticación y matriz de roles

**Implementado:** ❌ bloqueante transversal · **Depende de:** BK1 (pieza de auth)

- [ ] 6.1 **`[BK1]`** Proveer `JwtAuthGuard` — hoy no existe en el repo
- [ ] 6.2 **Urgente** Proteger `GET /api/registros-cambio`: hoy cualquiera que alcance el endpoint lee el historial completo de todos los pedidos, incluido PHI de prendas y participantes
- [ ] 6.3 Aplicar `@UseGuards(JwtAuthGuard)` a los 7 endpoints de `3-diseno` y los 6 de `4-taller-produccion`
- [ ] 6.4 Restringir `aprobar` a `DISENO` / `ADMINISTRADOR` y `POST /nestings*` a `PRODUCCION` / `ADMINISTRADOR`
- [ ] 6.5 Definir qué roles leen el historial de un pedido que no es suyo — R-J08: los permisos se aplican en la consulta, no en el controlador
- [ ] 6.6 Dejar de aceptar `usuarioId` desde el body: debe venir del token, o un usuario puede aprobar en nombre de otro

---

## Task 7: Auditoría de entidades sin pedido — `[BK1]`

**Depende:** Task 1 (decisión de BK1) · **Bloquea:** auditoría completa de Task 3

- [ ] 7.1 **`[BK1]`** Decidir cómo auditar `Nesting` y `ArchivoTif`: no pertenecen a un solo pedido (R-K11)
- [ ] 7.2 **NUNCA** inventar un `pedidoId` aproximado para destrabarlo → fabricar atribución es peor que no auditar
- [ ] 7.3 Una vez decidido el modelo, implementar la auditoría de `crear` (Task 3.15) y `agregarArchivo`

---

## Task 8: E2E de triggers y constraints SQL

**Depende:** Task 2, Task 3 · **Requiere:** PostgreSQL real (los tests unitarios mockean Prisma y no disparan triggers)

- [ ] 8.1 Test e2e: `trg_exigir_codigo_de_color` aborta el `APROBADO` con un `ColorPedido` sin `codigoHex` — **R-K05**
- [ ] 8.2 Test e2e: `UPDATE` y `DELETE` sobre `RegistroCambio` fallan con `42501` por el `REVOKE` de `constraints.sql` — **R-I02**
- [ ] 8.3 Test e2e: dos `POST /partes` concurrentes → una recibe `409` por `NestingParte_nestingId_numeroParte_key`
- [ ] 8.4 Test e2e: dos `POST /disenos` concurrentes sobre el mismo pedido → una recibe `409` por `Diseno_pedidoId_version_key`
- [ ] 8.5 Test e2e: `color_hex_valido` rechaza un `codigoHex` que no matchea `^#[0-9A-F]{6}$`

---

## Notas de Implementación

### Reglas que se incumplen por ignorancia y cuestan datos reales

- **El consumo de tela de un pedido NO es un cálculo, es una asignación** (R-K15). En un nesting real se imprimieron 1497 cm de un pedido y 116 cm de otro sobre la misma tela. Si el sistema carga el total del nesting a un solo pedido, ese pedido queda inflado y el otro en cero. Por eso `Nesting` es entidad propia y `NestingParte` apunta a su `pedidoId`.
- **Un color no es una palabra** (R-K05). Tres de nueve pedidos reales fallaron: "azul oscuro" salió morado, "amarillo brasil" salió amarillo oro, "verde" salió muy oscuro. El único que salió bien tenía `#f7f4f2` y `#cc9933`. El color puede registrarse sin HEX mientras se conversa con el cliente, pero el diseño **no se aprueba** hasta que todos lo tengan. Lo garantiza el trigger `trg_exigir_codigo_de_color`, no el backend.
- **R-K02:** obsequio y muestra se **fabrican pero no se cobran**. Cuentan para producción, no para el importe. El importe no vive en la prenda: se calcula.
- **R-K04:** el número de prenda es texto. `"S/N"` es un valor válido y distinto de `null`.
- **R-E07 / R-K03:** todo resumen se calcula sobre `Prenda`, nunca sobre `Participante`, y multiplicando por los componentes físicos del producto — nunca contando "unidades".

### Patrones de código a seguir en todo el proyecto

- **Auditoría atómica siempre.** `await this.auditoria.registrar({...}, tx)` dentro del mismo `this.prisma.$transaction(async (tx) => {...})` que escribe el cambio. Sin el `tx`, hay una ventana en la que el cambio está aplicado sin traza y R-I01 no se cumple. Aplícale en Task 3.15.
- **`??` para normalizar, no `||`.** Un `valorAnterior` deliberadamente vacío (`""`) se convierte en `null` con `||` y se pierde la distinción entre "vació el campo" y "nunca tuvo valor".
- **Nunca reimplementar un trigger en TypeScript.** R-K05 (colores), R-G03 (numeración), R-C05 (excepción redundante) y R-H12 (lista cerrada) ya están en `constraints.sql`. Duplicar la validación en el backend crea dos fuentes de verdad que divergen. Si una regla no tiene trigger, es porque necesita tests, no un `if` en el service.
- **FK dura solo donde el borrado en cascada es correcto.** `NestingParte` y `ArchivoTif` usan `ON DELETE CASCADE` (el nesting es dueño de ellos). `RegistroCambio.autorParticipanteId` **no** es FK a propósito (R-D08): el registro debe sobrevivir al participante. No lo "arregles" como si fuera un descuido.
- **Enums exactos, no cadenas.** `EstadoDiseno`, `RolUsuario`, `OrigenCambio` y `TipoTarifa` son enums de Prisma. Serializarlos a string libre es la causa clásica de `estado: "RECHAZADO (color malo)"`, que no existe en el enum.
- **Errores de dominio con la excepción específica:** `NotFoundException` (no existe), `BadRequestException` (datos inválidos), `ConflictException` (transición de estado inválida o duplicado). El código HTTP es parte del contrato.
- **Soft delete solo donde el modelo lo declara.** `RegistroCambio` no tiene `deletedAt` y no debe tenerlo: R-I02 es append-only y el borrado no existe para ningún rol, ni por API.

### Decisiones no obvias ya tomadas

- **`valorNuevo` descriptivo en las altas.** En `agregarParte` se registra `"{codigo} #{n} [rib ]160x400cm"` en lugar de un par vacío. Un historial con `"creacion" → null` no se puede leer sin consultar la fila original.
- **Auditar solo el diff real.** `actualizarArtefactos` compara contra el valor previo y omite el registro si la URL es idéntica. Un historial con entradas inútiles deja de usarse.
- **El motivo de rechazo va a auditoría, no al estado.** Mezclado en el string rompía el enum y las consultas por `estado`.
- **`costoImpresion: null` ≠ `0`.** Sin tarifa vigente, el costo es `null` con una `nota` que cita R-K10. Devolver `0` se confunde con "impresión gratis" y el error pasa desapercibido en la conciliación.
- **`RECHAZADO` es terminal.** Un diseño rechazado no vuelve a `PROPUESTO`: el retrabajo crea `version + 1` en `BORRADOR`. El historial queda append-only y cada versión es inmutable.
- **`Nesting.anchoImpresionM` es fijo en 1.80** (R-K12). Lo que varía es el largo. Por eso el nombre de los TIF lleva `180x_` constante.

### Estado de calidad

- Tests unitarios: **23** en 3 archivos — `auditoria.service.spec.ts` (5), `diseno.service.spec.ts` (9), `nesting.service.spec.ts` (9). `npm test` → 23/23 OK · `npm run build` → OK.
- Lint: los errores que quedan son **preexistentes en BK1/BK2/core** (`participantes`, `prendas`, `prisma-exception.filter`) y no se tocaron.
- Tests e2e: **ninguno**. Ninguna regla garantizada por trigger SQL está verificada contra PostgreSQL real — ver Task 8.

### Límites respetados por BK3

- `schema.prisma` y `constraints.sql` **no se modificaron**.
- `1-nucleo-comercial/` y `2-operacion-prendas/` **no se tocaron**.
- Los tres módulos se desarrollaron sobre la rama `wip/bk2-diseno-en-progreso`.
