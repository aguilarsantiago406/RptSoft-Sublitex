# ROLES Y LIMITES DE RESPONSABILIDAD — SIPES Sublitex
# Version: 1.1 | 2026-09-16
# LEER ESTE ARCHIVO ANTES DE ESCRIBIR CUALQUIER LINEA DE CODIGO.

---

## IDENTIDAD DE ESTE REPOSITORIO

Este repositorio (RptSoft-Sublitex/) ES EL BACKEND BK1.
TU, que estas trabajando aqui, ERES BK1.

NO eres BK2. NO eres Frontend.
NO implementes participantes, prendas, excepciones ni personalizaciones.
Eso pertenece a BK2, que es un modulo separado trabajado por otro equipo.

Si el contrato_api.md de la raiz de sublitex/ describe 17 endpoints de
participantes/prendas — ESO ES BK2, no lo toques.
Tu contrato es RptSoft-Sublitex/contrato-api.md (este repo, API BK1).

---

## LO QUE SI HACES TU (BK1):
- CRUD de Clientes          → /api/clientes
- CRUD de Pedidos           → /api/pedidos
- Cambio de Estado          → PATCH /api/pedidos/:id/estado
- Colores oficiales HEX     → /api/pedidos/:id/colores
- Creacion y listado de Grupos → /api/pedidos/:id/grupos
- Actualizacion de Grupos   → PUT /api/grupos/:id
- Catalogo de TipoProducto  → GET /api/tipos-producto
  (tambien disponible como alias `/api/catalogos/tipos-producto`)
- Resumen de produccion     → GET /api/pedidos/:id/resumen-produccion
  (el endpoint lo expones TU, pero los datos los calcula con lo que BK2 guardo)
- Configurar el servidor NestJS (main.ts, app.module.ts, prisma.service.ts)
- Mantener schema.prisma y ejecutar migraciones

## LO QUE NO HACES TU (no es tu territorio):
- NO registras Participantes (integrantes de un grupo) — eso es BK2
- NO creas Prendas individuales ni asignas tallas — eso es BK2
- NO implementas Bloques (DISENO, LISTA, COMERCIAL) — eso es BK2
- NO creas pantallas, formularios ni vistas — eso es Frontend
- NO conectas con GoHighLevel (CRM) — eso es Fase 5

---

## TABLA DE PROPIEDAD DE ENDPOINTS

| Endpoint                                     | Dueno    |
|----------------------------------------------|----------|
| POST/GET /api/clientes                       | BK1 (TU) |
| GET /api/clientes/:id                        | BK1 (TU) |
| POST/GET /api/pedidos                        | BK1 (TU) |
| GET /api/pedidos/:id                         | BK1 (TU) |
| PATCH /api/pedidos/:id/estado                | BK1 (TU) |
| POST/GET /api/pedidos/:id/colores            | BK1 (TU) |
| DELETE /api/pedidos/:id/colores/:colorId     | BK1 (TU) |
| POST/GET /api/pedidos/:id/grupos             | BK1 (TU) |
| GET/PUT/PATCH/DELETE /api/grupos/:id         | BK1 (TU) |
| GET /api/catalogos/tipos-producto            | BK1 (TU) |
| GET /api/pedidos/:id/resumen-produccion      | BK1 (TU) |
| POST /api/grupos/:id/participantes           | BK2      |
| GET  /api/grupos/:id/participantes           | BK2      |
| PATCH /api/participantes/:id                 | BK2      |
| Prendas, Bloques, Disenos, Excepciones       | BK2      |
| Todas las pantallas y vistas                 | Frontend |

---

## INTEGRACION CON BK2

BK2 consume `pedidoId`, `grupoId`, `tipoProductoId`, `cantidadContratada`,
`colorId` y los catálogos expuestos por BK1. BK1 no duplica ni implementa las
rutas de participantes, prendas, excepciones o personalizaciones definidas en
el contrato BK2.

## REGLA DE ORO

Si el endpoint que vas a crear NO esta en la columna BK1 (TU) de la tabla,
NO lo implementes. Avisa al equipo correspondiente.
