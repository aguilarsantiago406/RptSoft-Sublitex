# BK3 — Resumen del Frente Diseño · Producción · Auditoría

> Trabajo realizado sobre `Backend/` en la rama `wip/bk2-diseno-en-progreso`,
> **sin tocar `1-nucleo-comercial` (BK1) ni `2-operacion-prendas` (BK2)**.

---

## 🎯 Alcance

| Módulo | Frente | Estado |
|--------|--------|--------|
| `3-diseno/` | Versionado y aprobación gráfica | ✅ Implementado + correcciones |
| `4-taller-produccion/` | Nesting, corte, archivos TIF, consumo | ✅ Implementado (antes esqueleto) |
| `5-auditoria/` | Trazabilidad inmutable | ✅ Implementado (antes esqueleto) |

---

## 🔍 Auditoría (`5-auditoria`)

- **`AuditoriaService`** compartido e inyectable:
  - `registrar(data, tx?)` → escribe en `RegistroCambio` (R-I01). Acepta transacción para que la auditoría sea **atómica** con el cambio.
  - `listar(query)` → solo lectura (R-I02 append-only).
- **Endpoints:** `GET /api/registros-cambio`
  - Filtros: `pedidoId`, `entidad`, `entidadId`, `origen`, `limit`.
- Atribuye `autorUsuarioId` y `autorRol` según el origen (R-I04).

## 🎨 Diseño (`3-diseno`)

Flujo completo `BORRADOR → PROPUESTO → APROBADO / RECHAZADO`, con versionado `@@unique([pedidoId, version])`.

- **`crear` / transiciones de estado:** cambio + auditoría en `$transaction`.
- **Corrección:** `actualizarArtefactos` y `rechazar` ahora también son transaccionales (antes el UPDATE iba fuera de la transacción).
- **Corrección:** el motivo de rechazo ya no se mezcla en el string del estado (`"RECHAZADO (motivo)"`), sino como campo de auditoría aparte `motivoRechazo`.
- **`aprobar`** congela `aprobadoEn`, `aprobadoPorId`, y registra `autorRol`.
- R-K05 (colores con HEX) lo garantiza el trigger SQL `trg_exigir_codigo_de_color` en `constraints.sql`.
- **Endpoints:** `POST /api/disenos`, `PATCH /api/disenos/:id/{artefactos|proponer|aprobar|rechazar}`, `GET /api/pedidos/:pedidoId/disenos`, `GET /api/disenos/:id`

## 🖨️ Producción (`4-taller-produccion`)

- **`POST /api/nestings`** — crea nesting (valida tela y usuario, código único).
- **`GET /api/nestings`, `GET /api/nestings/:id`** — listado y detalle con partes + archivos.
- **`POST /api/nestings/:id/partes`** — parte real asignada a un pedido (R-K11). Número de parte auto-incremental; audita contra el pedido de la parte.
- **`POST /api/nestings/:id/archivos`** — archivo TIF con serie coherente (R-K13).
- **`GET /api/consumo-tela/pedido/:pedidoId`**:
  - **R-K15** — suma **solo las partes del pedido** (un nesting puede mezclar pedidos).
  - Separa tela / rib y reporta el ancho máximo usado.
  - **R-K14 + R-K10** — costo = metros lineales × tarifa vigente de impresión. Si no existe tarifa, devuelve `null` con nota explicativa; nunca precio escrito a mano.

---

## 🧪 Calidad

- **Tests unitarios:** 23 — `auditoria.service.spec.ts`, `diseno.service.spec.ts`, `nesting.service.spec.ts`.
- `npm test` → **23/23 OK** · `npm run build` → **OK**.
- Lint: solo quedan **errores preexistentes en BK1/BK2/core** (`participantes`, `prendas`, `prisma-exception.filter`); no se tocaron.

---

## ⛔ Límites respetados

- No se modificó `schema.prisma` ni `constraints.sql`.
- No se tocó `1-nucleo-comercial/` ni `2-operacion-prendas/`.

## 🧭 Pendientes que requieren coordinación con BK1

1. **Cerrar el bloque `DISENO` del pedido al aprobar (R-H02)** — `BloquePedido` es territorio BK1.
2. **Auditar `Nesting` y `ArchivoTif`** — `RegistroCambio.pedidoId` es FK no nula y estas entidades no pertenecen a un solo pedido (R-K11). Requiere revisar el modelo.
3. **`JwtAuthGuard`** no existe en el repo; los endpoints de bk3 no llevan autenticación aún.

---

*Generado: 23/09/2026 · Frente BK3*