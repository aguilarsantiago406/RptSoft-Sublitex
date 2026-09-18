# PLAN POR FASES — SIPES Sublitex
# Estado actualizado al: 2026-09-17
# Propósito: orientar a cualquier agente CLI que trabaje en este proyecto

---

## FASE 1 — Diseño y Contratos ✅ COMPLETADA

### Entregables producidos:
- `contrato-api.md` — contrato BK1 con entradas, salidas, reglas y errores.
- `prisma/schema.prisma` — modelo de datos completo v0.2.
- `prisma/01_constraints.sql` — 14 reglas mediante 8 triggers, checks e índices.
- `SIPES-repo/fixtures/PROMO2002_prendas.csv` — fixture oficial de 28 filas.

### Fuentes de autoridad:
- `01___Manual_SIPES.md` — proceso, sprints y entregables.
- `02___Catálogo_de_reglas.md` — reglas de negocio.
- `contrato-api.md` — superficie BK1.
- `..\..\contrato_api.md` — superficie BK2.
- `.context/BK1_TABLES.md` — ownership de tablas y dependencias.
- `openspec/bk1/spec.md` — especificación consolidada BK1.

---

## FASE 2 — Backend Core (BK1) ✅ COMPLETADA Y ALINEADA

### Stack implementado:
- NestJS 10 + TypeScript + Prisma ORM + PostgreSQL + Swagger UI
- Puerto: 3001 (evita conflicto con Next.js en 3000)

### Módulos creados y operativos:
| Módulo    | Controlador                        | Endpoints | Estado |
|-----------|------------------------------------|-----------|--------|
| Clientes  | POST, GET, GET/:id                 | 3         | ✅ OK  |
| Pedidos   | POST, GET, GET/:id, PATCH Estado   | 4         | ✅ OK  |
| Colores   | POST, GET, DELETE                  | 3         | ✅ OK  |
| Grupos    | POST, GET, GET/:id, PUT, PATCH política, DELETE | 6 | ✅ OK |

### Correcciones críticas aplicadas (2026-09-16):
1. ❌→✅ PoliticaNumeracion: Eliminado valor "CORRELATIVO" (no existe en schema).
   Solo LIBRE y UNICA son válidos.
2. ❌→✅ EstadoPedido: Agregados EN_REVISION, EN_PRODUCCION, ENTREGADO al DTO.
3. ❌→✅ PATCH Estado: Cambiado de @Put a @Patch en pedido.controller.ts.
   Campo "motivo" cambiado de requerido a opcional.

### Cierre de Fase 2:
- [x] Seed idempotente de catálogo TipoProducto, TallaCatalogo, Atributo, ValorAtributo y UbicacionPersonalizacion.
- [x] GET /api/catalogos/tipos-producto y alias oficial GET /api/tipos-producto.
- [x] GET/POST /api/pedidos/:id/resumen-produccion, con comparación contra cantidadContratada y piezas físicas BOM.
- [x] POST /api/pedidos/:id/colores acepta un color o un array validado de colores.
- [x] GET /api/grupos/:id devuelve detalle, tipo de producto y configuración.
- [x] DELETE /api/grupos/:id, protegido contra eliminación de grupos con participantes o prendas.
- [x] Ownership de tablas BK1/BK2 documentado contra el SVG.
- [x] OpenSpec inicial de BK1 creado a partir del manual, catálogo, SVG, schema y contrato.

---

## FASE 3 — Backend Participantes y Prendas (BK2) 🔲 PENDIENTE

### Objetivo: Que los integrantes de cada grupo puedan registrar sus tallas y números.

### Endpoints a implementar:
```
POST   /api/grupos/:grupoId/participantes     — Crear participante en grupo
GET    /api/grupos/:grupoId/participantes     — Listar participantes del grupo
PATCH  /api/participantes/:id                — Actualizar talla/número de participante
```

### Dependencias de Fase 2 que BK2 necesita:
- grupoId del grupo creado por BK1
- tipoProductoId para calcular piezas físicas (R-K03)
- cantidadContratada del grupo para el resumen (R-B02)

### Reglas críticas para BK2:
- R-G03: Si politicaNumeracion = UNICA, no puede haber 2 participantes con el mismo
  número en el mismo grupo. 01_constraints.sql ya lo rechaza en Postgres.
- R-K01: Género (HOMBRE/MUJER/NINO/NINA) ≠ Corte de prenda ≠ Cuello.
  Son 3 campos separados en el modelo Prenda.
- R-K02: TipoPrenda = OBSEQUIO o MUESTRA se fabrica pero no se cobra.
- R-D05: Los participantes se registran sin cuenta de usuario (enlace firmado).

---

## FASE 4 — Frontend (Next.js) 🔲 PENDIENTE

### Stack: Next.js (puerto 3000) consumiendo BK1 en localhost:3001

### Pantallas planificadas:
- [ ] Listado de Pedidos (vista principal)
- [ ] Crear Pedido (wizard: datos generales → grupos → colores)
- [ ] Detalle de Pedido (grupos, colores, estado, resumen)
- [ ] Formulario de Participantes (vínculo externo, sin login)

---

## FASE 5 — Integración GoHighLevel (GHL) ⏸️ OPCIONAL / FUERA DE ALCANCE POR AHORA

### Objetivo: Sincronizar clientes y pedidos con el CRM GHL.
### Campo pendiente: `ghlContactId` en modelo Cliente (actualmente null).
### Nota: Se menciona para referencia, pero NO se realizará por ahora. Es la última fase, opcional y solo si se decide en el futuro.

---

## CÓMO INICIAR EL BACKEND (comandos)

```bash
# 1. Instalar dependencias (solo la primera vez)
cd C:/Users/Santiago/Downloads/sublitex/RptSoft-Sublitex
npm install

# 2. Migrar la base de datos (solo la primera vez o al cambiar schema.prisma)
npx prisma migrate dev --name init

# 3. Levantar el servidor (todas las sesiones siguientes)
npm start

# 4. Verificar que funciona
# Swagger: http://localhost:3001/api/docs
```
