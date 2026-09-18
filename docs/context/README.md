# .context — Contexto del Proyecto SIPES Sublitex
# LEER ESTE ARCHIVO PRIMERO antes de trabajar en cualquier módulo.

---

## ¿Qué es este proyecto?

SIPES es el Sistema de Gestión Operativa de Pedidos de Sublitex,
una empresa que fabrica ropa deportiva personalizada (sublimación textil).
Gestiona el ciclo completo de un pedido: desde la cotización hasta la entrega.

## Estructura de esta carpeta

```
.context/
├── README.md               ← Empezar aquí (este archivo)
├── ROLES.md                ← ¿Qué hago YO y qué NO es mío? (LEER SEGUNDO)
├── api/
│   └── ENDPOINTS.md        ← Referencia rápida de todos los endpoints BK1/BK2
├── BK1_TABLES.md           ← Tablas, ownership y dependencias de BK1
├── reglas/
│   └── REGLAS_NEGOCIO.md   ← Enums, reglas R-XXX y restricciones críticas
└── fases/
    └── FASES.md            ← Plan por fases, estado actual y pendientes
```

Las fuentes canónicas están fuera de `.context`:

- `prisma/schema.prisma` — implementación activa del modelo.
- `prisma/01_constraints.sql` — restricciones activas de PostgreSQL.
- `contrato-api.md` — contrato oficial BK1.
- `..\..\01___Manual_SIPES.md` — manual operativo oficial.
- `..\..\02___Catálogo_de_reglas.md` — catálogo maestro de reglas.
- `SIPES-repo/fixtures/PROMO2002_prendas.csv` — fixture oficial de PROMO 2002.
- `..\..\contrato_api.md` — contrato complementario de BK2.
- `openspec/bk1/spec.md` — especificación consolidada de BK1.

---

## Estado actual del proyecto (2026-09-17)

| Fase | Descripción                       | Estado       |
|------|-----------------------------------|--------------|
| 1    | Diseño, contratos y schema        | ✅ Completada |
| 2    | Backend Core BK1 (NestJS)         | ✅ Completada y alineada al contrato v0.2 + bloque K |
| 3    | Backend BK2 (Participantes)       | 🔲 Pendiente  |
| 4    | Frontend (Next.js)                | 🔲 Pendiente  |
| 5    | Integración GoHighLevel           | ⏸️ Opcional / fuera de alcance |

---

## Reglas críticas que NUNCA debes violar

1. **PoliticaNumeracion**: Solo existen `LIBRE` y `UNICA`.
   ⚠️ NUNCA usar `CORRELATIVO` — no existe en Prisma/Postgres.

2. **EstadoPedido**: El enum completo tiene 8 valores.
   ⚠️ NUNCA usar `EN_COTIZACION`, `ACTIVO` o `FINALIZADO`.

3. **Código HEX de Color**: Formato `#RRGGBB` estricto (6 dígitos).
   ⚠️ NUNCA aceptar `#FFF`, `azul` o `rgb()`.

4. **tipoProductoId en Grupo**: Es FK obligatoria.
   ⚠️ Sin seed de TipoProducto no se pueden crear grupos.

5. **Método HTTP del Estado**: Es `PATCH`, NO `PUT` ni `GET`.

---

## Cómo iniciar el servidor backend

```bash
cd C:/Users/Santiago/Downloads/sublitex/RptSoft-Sublitex

# Primera vez (o después de cambiar schema.prisma):
npx prisma migrate dev --name init

# Todas las sesiones:
npm start

# Verificar:
# http://localhost:3001/api/docs   ← Swagger
```

---

## Para BK2 (Fase 3)

Lo que BK2 necesita de BK1:
- `grupoId` del grupo para registrar participantes
- `tipoProductoId` para calcular piezas físicas (R-K03)
- `cantidadContratada` del grupo para el resumen de producción (R-B02)
- Endpoint compartido: `GET /api/pedidos/:id/resumen-produccion`

BK1 no implementa participantes, prendas, excepciones ni personalizaciones. Esas
rutas pertenecen al contrato BK2 y deben consumir los identificadores y catálogos
expuestos por BK1.

Ver detalle completo en: `fases/FASES.md` sección Fase 3.
