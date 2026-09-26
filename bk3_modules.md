# 📋 Plan de Cierre y Actividades Pendientes — Frente BK3 (Diseño, Producción y Auditoría)

**Proyecto:** SIPES (*Sistema de Información y Pedidos para la Empresa Sublitex*)  
**Módulos Involucrados:**
* `Backend/src/modules/3-diseno/` (Frente 3 — Diseño)
* `Backend/src/modules/4-taller-produccion/` (Frente 4 — Taller y Producción)
* `Backend/src/modules/5-auditoria/` (Frente 5 — Auditoría)
**Referencia Oficial:** `docs_bk2/reglas_generales.md` y `Backend/prisma/schema.prisma`  
**Fecha:** 24 de Septiembre de 2026  

---

## 🎯 Objetivo
Completar, conectar y blindar definitivamente los módulos de **Diseño**, **Taller-Producción** y **Auditoría**, asegurando que respeten los candados de cierre del pedido (**R-H02**, **R-H04**), las restricciones físicas de corte/TIF (**R-K12**, **R-K13**) y la seguridad JWT de la aplicación.

---

## 📊 1. Diagnóstico del Estado Actual

* **Estructura y Base de Datos:** ✅ Las tablas en Prisma (`Diseno`, `Nesting`, `NestingParte`, `ArchivoTif`, `RegistroCambio`) se respetan fielmente sin inventar columnas ni romper relaciones.
* **Transacciones:** ✅ Transaccionalidad atómica (`$transaction`) en transiciones de diseño, cierre de bloque `DISENO`, creación de partes y auditoría append-only.
* **Candados Cruzados y Reglas de Negocio:** ✅ 100% implementados y verificados. Producción rechaza partes si Diseño o Lista están abiertos (R-H04), Diseño valida atributos obligatorios (R-H02), bloque cerrado es de solo lectura (R-H12), archivos TIF respetan ≤ 5m (R-K13), cálculo de desperdicio lateral (R-K12) y autenticación JWT aplicada.
* **Pruebas:** ✅ 12/12 suites pasando (97/97 tests en verde), compilación limpia y build de producción exitoso.

---

## 📝 2. Lista de Actividades Ejecutadas por Módulo

---

### 🎨 A. Módulo 3: Diseño (`Backend/src/modules/3-diseno/`)

- [x] **Tarea 3.1: Candado de Aprobación de Diseño (Regla R-H02)**
  * Implementado en `DisenoService.aprobar()`: verifica que todos los atributos marcados como `obligatorio: true` en todos los grupos del pedido tengan su respectivo `ValorConfiguracion` asignado. Si falta alguno, lanza `BadRequestException` impidiendo la aprobación.
- [x] **Tarea 3.2: Conexión con `BloquePedido` (Regla R-H01)**
  * Al aprobar el diseño dentro de la misma transacción atómica, se actualiza o crea el registro en `BloquePedido` de tipo `DISENO` en estado `CERRADO` con `cerradoEn` y `cerradoPorId`.
- [x] **Tarea 3.3: Inmutabilidad de Diseño Cerrado (Regla R-H12)**
  * En `crear()`, `actualizarArtefactos()`, `proponer()` y `rechazar()`, se valida que el bloque `DISENO` del pedido no esté `CERRADO`. Si está cerrado, rechaza cualquier mutación.
- [x] **Tarea 3.4: Documentación OpenAPI / Swagger**
  * Se añadieron decoradores `@ApiProperty` y `@ApiPropertyOptional` en `CrearDisenoDto`, `ActualizarArtefactosDto` y `EstadoDisenoDto`.

---

### 🖨️ B. Módulo 4: Taller y Producción (`Backend/src/modules/4-taller-produccion/`)

- [x] **Tarea 4.1: Candado de Inicio de Producción (Regla R-H04) [CRÍTICO]**
  * En `NestingService.agregarParte()`, se verifica que el pedido tenga los bloques `DISENO` y `LISTA` en estado `CERRADO`. Si alguno está abierto, rechaza con `BadRequestException`.
- [x] **Tarea 4.2: Restricciones Físicas de Archivos TIF (Regla R-K13)**
  * Validador `@Max(5.00)` y validación en servicio para que el largo máximo por archivo sea 5 metros.
  * Validación de coherencia en la serie: `ordenEnSerie <= totalSerie` y `ordenEnSerie >= 1`.
- [x] **Tarea 4.3: Cálculo Explícito de Desperdicio Lateral (Regla R-K12)**
  * En el endpoint `GET /api/consumo-tela/pedido/:pedidoId`, se calcula y entrega `anchoMaximoUsadoCm`, `desperdicioLateralCm = 180 - anchoMaximoUsadoCm` y `porcentajeAprovechamientoAncho`.
- [x] **Tarea 4.4: Desglose de Consumo por Tipo de Tela (Regla R-K15)**
  * En `consumoPorPedido()`, se entrega un desglose agrupado por cada tipo de tela presente en los nestings del pedido (`desglosePorTela`), además del metraje de rib.
- [x] **Tarea 4.5: Rango de Vigencia de Tarifas de Taller (Reglas R-K10 / R-K14)**
  * Consulta de tarifa con rango estándar: `vigenteDesde <= ahora AND (vigenteHasta IS NULL OR vigenteHasta >= ahora)`. Si no hay tarifa vigente, retorna `costoImpresion: null` con nota explicativa sin inventar precios manuales.

---

### 🔍 C. Módulo 5: Auditoría (`Backend/src/modules/5-auditoria/`)

- [x] **Tarea 5.1: Completar Campos del Modelo `RegistroCambio` (Reglas R-I04 / R-I05)**
  * Interfaz y servicio extendidos para persistir `autorParticipanteId` (cambios por WhatsApp) y `prendasAfectadas` (impacto masivo de configuración general).
- [x] **Tarea 5.2: Filtros de Consulta Completos (Regla R-I03)**
  * Añadidos filtros por `autorUsuarioId` y por `campo` modificado en `ListarRegistrosCambioDto` y `AuditoriaService.listar()`.

---

### 🛡️ D. Seguridad y Guards JWT (Transversal a BK3)

- [x] **Tarea 6.1: Aplicar `@UseGuards(AuthGuard('jwt'))` y `@ApiBearerAuth()`**
  * Protegidos los 3 controladores:
    * `DisenoController`
    * `NestingController`
    * `AuditoriaController`
- [x] **Tarea 6.2: Extracción Automática del Autor**
  * Extracción de `req.user.id` y `req.user.rol` desde el token JWT en creación de nestings, partes, aprobación y rechazo de diseños, vinculándolos directamente a la auditoría.

---

### 🧪 E. Cobertura de Pruebas Unitarias

- [x] **Tarea 7.1: Tests Unitarios para Candados y Restricciones Físicas**
  * `diseno.service.spec.ts`: Tests para R-H02 (rechazo por falta de grupos o atributos obligatorios), R-H01 (cierre de BloquePedido DISENO), R-H12 (inmutabilidad).
  * `nesting.service.spec.ts`: Tests para R-H04 (rechazo si Diseño/Lista están abiertos), R-K13 (largo ≤ 5m y coherencia de serie), R-K12 y R-K15 (desperdicio lateral y desglose).
  * `auditoria.service.spec.ts`: Tests para nuevos filtros `autorUsuarioId` y `campo` (R-I03), campos extendidos R-I04 y R-I05.

---

## 🏆 Resultado Final
1. **Flujo Cero-Fuga:** Producción no puede cortar tela si diseño no fue aprobado y la lista cerrada (R-H04).
2. **Auditoría Completa:** Trazabilidad inmutable de aprobaciones, rechazos, creación de partes y cambios de configuración.
3. **100% Alineado y Funcional:**
   * `npx tsc --noEmit` ➔ 0 errores.
   * `npm test` ➔ **12 suites aprobadas, 97 pruebas en verde**.
   * `npm run build` ➔ Compilación exitosa para producción.
