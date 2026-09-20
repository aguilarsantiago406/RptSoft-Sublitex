# .context - Contexto del Proyecto SIPES Sublitex
# LEER ESTE ARCHIVO PRIMERO antes de trabajar en cualquier modulo.

---

## Que es este proyecto?

SIPES es el Sistema de Gestion Operativa de Pedidos de Sublitex,
una empresa que fabrica ropa deportiva personalizada (sublimacion textil).
Gestiona el ciclo completo de un pedido: desde la cotizacion hasta la entrega.

## Estructura de esta carpeta

```
docs/context/
    README.md               Empezar aqui (este archivo)
    ROLES.md                Que hago YO y que NO es mio? (LEER SEGUNDO)
    api/
        ENDPOINTS.md        Referencia rapida de todos los endpoints BK1/BK2
    BK1_TABLES.md           Tablas, ownership y dependencias de BK1
    reglas/
        REGLAS_NEGOCIO.md   Enums, reglas R-XXX y restricciones criticas
    fases/
        FASES.md            Plan por fases, estado actual y pendientes
```

Las fuentes canonicas estan fuera de `.context`:

- `Backend/prisma/schema.prisma` implementacion activa del modelo.
- `Backend/prisma/01_constraints.sql` restricciones activas de PostgreSQL.
- `contrato-api.md` contrato oficial BK1.
- `..\..\01___Manual_SIPES.md` manual operativo oficial.
- `..\..\02___Catalogo_de_reglas.md` catalogo maestro de reglas.
- `SIPES-repo/fixtures/PROMO2002_prendas.csv` fixture oficial de PROMO 2002.
- `..\..\contrato_api.md` contrato complementario de BK2.
- `openspec/bk1/spec.md` especificacion consolidada de BK1.

---

## Estado actual del proyecto (2026-09-20)

| Fase | Descripcion                          | Estado              | Avance |
|------|--------------------------------------|---------------------|--------|
| 1    | Diseno, contratos y schema           | Completada          | 100%   |
| 2    | Backend Core BK1 (NestJS)            | Completada (ver nota)| 85%   |
| 3    | Backend BK2 (Participantes)          | Pendiente           | 0%     |
| 4    | Frontend (Next.js)                   | Pendiente           | 0%     |
| 5    | Integracion GoHighLevel              | Opcional / Fuera alcance | -  |

### Nota Fase 2 - Que falta para el 100%:

**1. Tests de Auth y Comercial (nuevo)**
Los modulos Auth y Comercial (Tarifas y Envios) se implementaron despues de los tests
existentes. No tienen cobertura propia. Ver lista exacta de casos en `fases/FASES.md`.

**2. Migracion de BD en cada entorno**
La migracion `20260920052708_add_password_to_usuario` debe ejecutarse en cada
entorno con `npx prisma migrate dev` dentro de la carpeta Backend.

---

## Reglas criticas que NUNCA debes violar

1. **PoliticaNumeracion**: Solo existen `LIBRE` y `UNICA`.
   NUNCA usar `CORRELATIVO` no existe en Prisma/Postgres.

2. **EstadoPedido**: El enum completo tiene 8 valores.
   NUNCA usar `EN_COTIZACION`, `ACTIVO` o `FINALIZADO`.

3. **Codigo HEX de Color**: Formato `#RRGGBB` estricto (6 digitos).
   NUNCA aceptar `#FFF`, `azul` o `rgb()`.

4. **tipoProductoId en Grupo**: Es FK obligatoria.
   Sin seed de TipoProducto no se pueden crear grupos.

5. **Metodo HTTP del Estado**: Es `PATCH`, NO `PUT` ni `GET`.

6. **JWT_SECRET**: Debe estar definido en `.env`. El valor hardcodeado es solo
   para desarrollo local, NUNCA para produccion.

---

## Como iniciar el servidor backend

```bash
cd C:/Users/Santiago/Downloads/sublitex/RptSoft-Sublitex/Backend

# Primera vez (o despues de cambiar schema.prisma):
npx prisma migrate dev

# Todas las sesiones:
npm run start:dev

# Verificar:
# http://localhost:3001/api/docs   Swagger
```

---

## Para BK2 (Fase 3)

Lo que BK2 necesita de BK1:
- `grupoId` del grupo para registrar participantes
- `tipoProductoId` para calcular piezas fisicas (R-K03)
- `cantidadContratada` del grupo para el resumen de produccion (R-B02)
- Endpoint compartido: `GET /api/pedidos/:id/resumen-produccion`

BK1 no implementa participantes, prendas, excepciones ni personalizaciones. Esas
rutas pertenecen al contrato BK2 y deben consumir los identificadores y catalogos
expuestos por BK1.

Ver detalle completo en: `fases/FASES.md` seccion Fase 3.
