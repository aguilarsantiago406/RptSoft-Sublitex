# SIPES — Reporte de Cierre de Sprint 1 (Semana 1)

**Proyecto:** SIPES (SIstema de PEdidos Sublitex)  
**Frente:** Frontend (Frontend 1 · Base + Frontend 2 y 3 · Tabla)  
**Fecha:** 19 de septiembre de 2026  
**Objetivo:** Cierre del MVP Frontend, verificación del pedido real PROMO 2002, integración con el contrato BK2 v2.1 y reporte formal de reglas.

---

# Parte 1 · Lo que dice la máquina

### 1. Salida de Tests Unitarios y de Integración (`npm test -- --verbose`)

```text
 RUN  v5.0.1 sublitex-web

 ✓ src/domain/bom.test.ts (3 tests)
 ✓ src/domain/precios.test.ts (5 tests)
 ✓ src/domain/proforma.test.ts (4 tests)
 ✓ src/domain/validacion.test.ts (3 tests)
 ✓ src/services/validador.test.ts (10 tests)
 ✓ src/services/adaptador.test.ts (10 tests)
 ✓ src/mocks/simulador.test.ts (6 tests)
 ✓ src/services/integracion.test.ts (8 tests)
 ✓ src/components/pedidos/ListaPedidos.test.tsx (5 tests)
 ✓ src/components/detalle/DetallePedido.test.tsx (6 tests)
 ✓ src/components/prendas/TablaPrendas.test.tsx (6 tests)
 ✓ src/components/proforma/ResumenProforma.test.tsx (4 tests)
 ✓ src/components/catalogos/VistaCatalogos.test.tsx (3 tests)

 Test Files  13 passed (13)
      Tests  73 passed (73)
   Duration  17.50s
```

### 2. Reglas de Negocio con Test (`R-*`)

Las siguientes reglas del catálogo cuentan con pruebas automatizadas en `src/`:

| Identificador | Regla Verificada | Archivo de Test |
|---|---|---|
| `R-K10` | Precio unitario derivado de tarifas (`base + recargo talla + recargo tela + recargo cuello + recargo acabado`) | `src/domain/precios.test.ts`, `src/services/adaptador.test.ts` |
| `R-K02` | Prendas de obsequio y muestra siempre tienen precio 0.00 aunque existan recargos | `src/domain/precios.test.ts`, `src/components/proforma/ResumenProforma.test.tsx` |
| `R-K03` | Desglose físico de producción (BOM): piezas físicas (camisetas, shorts, medias) calculadas por componentes de producto | `src/domain/bom.test.ts`, `src/components/prendas/TablaPrendas.test.tsx`, `src/components/catalogos/VistaCatalogos.test.tsx` |
| `R-K04` | Dorsal como texto: valor `S/N` legítimo y números repetidos permitidos por defecto (política libre) | `src/domain/validacion.test.ts`, `src/mocks/simulador.test.ts`, `src/components/prendas/TablaPrendas.test.tsx` |
| `R-K05` | Muestrario de colores: validación de código HEX y alerta visible para color sin código | `src/components/detalle/DetallePedido.test.tsx` |
| `R-K07` | Proforma con adelanto sugerido 50%, adelanto recibido editable y saldo dinámico; ningún precio editable a mano | `src/domain/proforma.test.ts`, `src/components/proforma/ResumenProforma.test.tsx` |
| `R-C06` / `R-E07` | Distinción visual obligatoria de excepciones frente a lo heredado del grupo (6 cortes Entallado vs 22 Recto) | `src/services/adaptador.test.ts`, `src/components/prendas/TablaPrendas.test.tsx` |
| `R-E03` | Edición en línea mediante un único `PATCH /api/prendas/:id` con ficha mínima; conservación de borrador ante fallo | `src/components/prendas/TablaPrendas.test.tsx`, `src/services/integracion.test.ts` |
| `R-G03` | Manejo de conflicto de dorsal duplicado (`409 Conflict`) cuando aplica política `UNICA` | `src/mocks/simulador.test.ts`, `src/components/prendas/TablaPrendas.test.tsx` |
| `R-H12` | Rechazo de modificaciones en lista cerrada o aprobada sin alterar el borrador local | `src/components/prendas/TablaPrendas.test.tsx` |

### 3. Salida de Verificación de Tipos (`npx tsc --noEmit`)

```text
Exit code: 0 (0 errores de TypeScript, compilación limpia en modo estricto)
```

### 4. Salida del Linter (`npm run lint`)

```text
> sublitex-web@0.1.0 lint
> eslint
Exit code: 0 (0 errores, 0 advertencias)
```

### 5. Salida de Compilación de Producción (`npm run build`)

```text
▲ Next.js 16.3.5 (Turbopack)
✓ Running next.config.ts took 105ms
✓ Compiled successfully in 1802ms
✓ Generating static pages using 7 workers (6/6) in 663ms

Route (app)
├ ○ / (Redirección a /pedidos)
├ ○ /_not-found
├ ƒ /api/catalogos
├ ƒ /api/pedidos
├ ƒ /api/pedidos/[id]
├ ƒ /api/pedidos/[id]/resumen-produccion
├ ƒ /api/prendas/[id]
├ ○ /catalogos
├ ○ /pedidos
└ ƒ /pedidos/[id]

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
Exit code: 0
```

### 6. Checklist de Integración con el Contrato BK2 v2.1 (`src/services/integracion.test.ts`)

| # | Endpoint | Contrato / DTO | Guard de Validación | Estado |
|---|---|---|---|---|
| 1 | `GET /api/pedidos` | `PedidoListaDto[]` | `esPedidoListaDto` | En verde |
| 2 | `GET /api/pedidos/:id` | `PedidoDetalleDto` | `esPedidoDetalleDto` | En verde |
| 3 | `GET /api/catalogos` | `CatalogosDto` | `esCatalogosDto` | En verde |
| 4 | `PATCH /api/prendas/:id` | `PrendaDto` | `esPrendaDto` | En verde |
| 5 | `GET /api/pedidos/:id/resumen-produccion` | `ResumenProduccionDto` | `esResumenProduccionDto` | En verde |
| - | Control de degradación | Rechaza demo data si `SIPES_BACKEND_URL` falla | `ErrorApi` | En verde |
| - | Integridad estricta | Falla ante JSON corrupto | `RespuestaInvalidaError` (R-CONTRATO) | En verde |

---

# Parte 2 · Lo que escribe cada frente

### Frontend 1 · Base (Shell, Lista de Pedidos, Cabecera y Catálogos)
1. **Qué entregué, nombrando las reglas por su identificador:**
   - Navegación global con Sidebar izquierdo en lugar de navbar superior para maximizar área de lectura en monitores de taller.
   - Lista de pedidos con filtros combinados y estado visual (`/pedidos`).
   - Cabecera del pedido con identificación completa, diseño aprobado, muestrario de colores con alerta para color sin HEX (`R-K05`), estampados con copia en portapapeles y bloque de envío a provincia con 7 campos.
   - Vista de catálogos y parámetros comerciales (`R-K03`, `R-K10`), con restricción de edición a rol administrador.
2. **Qué no llegué a entregar, y por qué:**
   - La edición activa de catálogos: el requerimiento del Sprint 1 para roles de oficina es exclusivamente de consulta y visualización de parámetros comerciales; la modificación queda para el módulo administrativo en Sprint 2.
3. **Qué regla me pareció ambigua, incompleta o imposible de probar:**
   - `R-K05` (color sin código HEX): no define el canal de alerta. Se resolvió con un pill de advertencia visual en rojo en el muestrario para evitar que pase inadvertido a producción.
4. **Dónde me trabé más de treinta minutos, y cómo salí:**
   - Scroll excesivo en `/pedidos/[id]`: la cabecera, la grilla de 26 columnas y la proforma en una única página obligaban a un desplazamiento vertical excesivo. Se resolvió dividiendo la pantalla en pestañas contextuales (Ficha Comercial, Prendas y Proforma) manteniendo acceso inmediato a cada sección.

### Frontend 2 y 3 · Tabla (Grilla de Prendas y Proforma)
1. **Qué entregué, nombrando las reglas por su identificador:**
   - Grilla de 26 columnas mostrando el pedido real PROMO 2002 con 28 prendas (`R-E08`, `R-K03`).
   - Dorsal como texto admitiendo `S/N` y dorsales duplicados (`R-K04`).
   - Distinción visual inmediata de las 6 excepciones de corte `Entallado` en damas frente a las 22 prendas `Recto` (`R-C06`, `R-E07`).
   - Edición en línea de ficha mínima en un solo guardado `PATCH` (`R-E03`), con retención de borrador ante errores 409 (`R-G03`) o lista cerrada (`R-H12`).
   - Barra de totales BOM con conteo físico exacto: 28 camisetas, 17 shorts y 17 medias (`R-K03`).
   - Proforma con desglose por producto, recargo de talla XL (S/ 9), total S/ 1049, sin IGV, con adelanto recibido editable y saldo dinámico (`R-K10`, `R-K02`, `R-K07`).
2. **Qué no llegué a entregar, y por qué:**
   - El guardado directo de personalizaciones y excepciones secundarias desde la tabla: el alcance pactado del Sprint 1 para la tabla es la Ficha Mínima (talla, dorsal, género, nombre en prenda); personalizaciones avanzadas se gestionan en Sprint 2.
3. **Qué regla me pareció ambigua, incompleta o imposible de probar:**
   - `R-K07` respecto a la edición de montos: la regla estipulaba que ningún monto se escribe a mano, pero la vendedora debe registrar el adelanto recibido. Se resolvió dejando exclusivamente el input de "Adelanto Recibido" como editable, calculando el saldo automáticamente.
4. **Dónde me trabé más de treinta minutos, y cómo salí:**
   - En el simulador, al simular la falla 409 de dorsal repetido bajo política `UNICA`: asegurar que el modal mantuviera los campos intactos requirió separar el estado de borrador del estado confirmado del servidor en `EditorPrenda.tsx`.

---

# Parte 3 · La pregunta de la semana

**¿Qué cosa creíamos el lunes que resultó falsa el viernes?**

> Creíamos que el dorsal era estrictamente un número único por pedido (`R-D04` en v0.1). El análisis del pedido real PROMO 2002 demostró que el dorsal es un texto (donde `S/N` es perfectamente legítimo), que los números se repiten frecuentemente por razones sentimentales (aparecieron 4 números 7 y 4 números 8 en la misma promoción), y que la unicidad no es una regla universal sino una política opcional por grupo (`R-K04`, Bloque G).

---

# Estado de Reglas de Negocio

### Reglas en Verde (Implementadas y Verificadas)
- `R-K10`: Precio unitario derivado de tarifas.
- `R-K02`: Muestras y obsequios a S/ 0.00.
- `R-K03`: Desglose físico de producción (BOM).
- `R-K04`: Dorsal como texto, `S/N` válido, números repetidos permitidos.
- `R-K05`: Muestrario de colores con código HEX y alerta ante ausencia.
- `R-K07`: Proforma comercial, adelanto sugerido 50%, saldo dinámico.
- `R-C06` / `R-E07`: Distinción visual entre valor general del grupo y excepción individual.
- `R-E03`: Edición de ficha mínima en un solo `PATCH` con retención de borrador ante fallo.
- `R-G03`: Detección y manejo de conflicto de dorsal en grupos con política única.
- `R-H12`: Bloqueo de edición ante lista cerrada.

### Reglas Pendientes (Asignadas a otros frentes para Sprint 1 o Sprint 2)
- `R-A01` a `R-A10`: Esquema relacional en Prisma y constraints de base de datos (Backend 1 / Guardián).
- `R-B01` a `R-B09`: Triggers de PostgreSQL en `01_constraints.sql` (Backend 1 / Guardián).
- `R-C01` a `R-C05`: Modelo de herencia relacional en BD (Backend 2).
- `R-D01` a `R-D06`: Flujo público de WhatsApp mediante enlaces con tokens de 7 días (Backend 2, Sprint 2).
- `R-F01` a `R-F04`: Registro de personalizaciones en base de datos (Backend 2, Sprint 2).
- `R-G01`, `R-G02`, `R-G04` a `R-G06`: Triggers de unicidad condicional en base de datos (Backend 1 / Guardián).
- `R-H01` a `R-H11`, `R-H13`: Mecanismo de versionado y congelamiento de listas en backend (Backend 1 y 2, Sprint 2).
