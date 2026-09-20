# PLAN POR FASES - SIPES Sublitex
# Estado actualizado al: 2026-09-20
# Proposito: orientar a cualquier agente CLI que trabaje en este proyecto

---

## FASE 1 - Diseno y Contratos  COMPLETADA

### Entregables producidos:
- `contrato-api.md` contrato BK1 con entradas, salidas, reglas y errores.
- `prisma/schema.prisma` modelo de datos completo v0.2.
- `prisma/01_constraints.sql` 14 reglas mediante 8 triggers, checks e indices.
- `SIPES-repo/fixtures/PROMO2002_prendas.csv` fixture oficial de 28 filas.

### Fuentes de autoridad:
- `01___Manual_SIPES.md` proceso, sprints y entregables.
- `02___Catalogo_de_reglas.md` reglas de negocio.
- `contrato-api.md` superficie BK1.
- `..\..\contrato_api.md` superficie BK2.
- `.context/BK1_TABLES.md` ownership de tablas y dependencias.
- `openspec/bk1/spec.md` especificacion consolidada BK1.

---

## FASE 2 - Backend Core BK1  COMPLETADA

### Stack implementado:
- NestJS 10 + TypeScript + Prisma ORM + PostgreSQL + Swagger UI
- Puerto: 3001 (evita conflicto con Next.js en 3000)
- Arquitectura: modulos en Backend/src/modules/1-nucleo-comercial/
- Core compartido: Backend/src/core/prisma/ y Backend/src/core/filters/

### Modulos operativos:
| Modulo           | Endpoints                                                                 | Estado |
|------------------|---------------------------------------------------------------------------|--------|
| Clientes         | POST, GET, GET/:id                                                        | OK     |
| Pedidos          | POST, GET, GET/:id, PATCH estado                                          | OK     |
| Colores          | POST (individual o array), GET, DELETE                                    | OK     |
| Grupos           | POST, GET, GET/:id, PUT, PATCH politica, DELETE                           | OK     |
| Catalogos        | GET tipos-producto, GET tallas, GET atributos, GET ubicaciones            | OK     |
| Resumen produccion | GET y POST /pedidos/:id/resumen-produccion                              | OK     |
| Auth             | POST login, POST register, GET me, GET /, GET/:id, PATCH/:id, PATCH/:id/password, DELETE/:id | OK |
| Comercial/Tarifas  | POST, GET, GET vigentes, GET/:id, PATCH/:id, DELETE/:id                 | OK     |
| Comercial/Envios   | POST, GET, PATCH, DELETE /pedidos/:pedidoId/envio                       | OK     |

### Correcciones aplicadas:
- PoliticaNumeracion: eliminado valor CORRELATIVO. Solo LIBRE y UNICA.
- EstadoPedido: 8 valores correctos segun schema.
- PATCH Estado: metodo correcto (no PUT).
- Auth controller: corregido @Param a @Query en filtro ?rol=
- PATCH /:id usuario: reemplazado tipo inline por UpdateUsuarioDto con validacion.
- PATCH /:id/password: reemplazado tipo inline por ChangePasswordDto con MinLength.
- JWT_SECRET agregado a .env y .env.example.

### Migracion de BD aplicada:
- 20260920052708_add_password_to_usuario: campo password en tabla Usuario.

### Tests existentes (35 passing):
- grupo.service.spec.ts
- estado-pedido.transitions.spec.ts
- pedido.service.spec.ts
- excepciones.spec.ts (modulo 2)
- participantes.spec.ts (modulo 2)
- personalizaciones.spec.ts (modulo 2)
- prendas.spec.ts (modulo 2)

---

## PENDIENTES PARA CIERRE TOTAL DE BK1

### 1. Tests unitarios de Auth y Comercial
Faltan specs para los modulos nuevos. Lo que cubrir cada uno:

**auth.service.spec.ts**
- login con credenciales correctas devuelve JWT
- login con credenciales incorrectas lanza UnauthorizedException
- login con usuario inactivo lanza UnauthorizedException
- register crea usuario con password hasheada
- register con email duplicado lanza ConflictException
- findAll sin filtro devuelve todos los usuarios
- findAll con filtro ?rol= devuelve solo ese rol
- findOne con id inexistente lanza NotFoundException
- update actualiza campos permitidos
- changePassword con contrasena incorrecta lanza UnauthorizedException
- remove con id inexistente lanza NotFoundException

**comercial.service.spec.ts**
- createTarifa crea correctamente
- createTarifa duplicada lanza ConflictException
- getTarifasVigentes filtra por fecha y activo
- createDatosEnvio crea correctamente
- createDatosEnvio duplicada lanza ConflictException
- createDatosEnvio con pedido inexistente lanza NotFoundException
- findDatosEnvio con pedido sin envio lanza NotFoundException

### 2. Migracion de BD
Despues de cada pull o cambio de schema hay que ejecutar:
```bash
cd Backend
npx prisma migrate dev
```
La migracion 20260920052708_add_password_to_usuario debe aplicarse en cada entorno.

---

## FASE 3 - Backend Participantes y Prendas (BK2)  PENDIENTE

### Objetivo: Que los integrantes de cada grupo puedan registrar sus tallas y numeros.

### Endpoints a implementar:
```
POST   /api/grupos/:grupoId/participantes
GET    /api/grupos/:grupoId/participantes
PATCH  /api/participantes/:id
```

### Dependencias de Fase 2 que BK2 necesita:
- grupoId del grupo creado por BK1
- tipoProductoId para calcular piezas fisicas (R-K03)
- cantidadContratada del grupo para el resumen (R-B02)

### Reglas criticas para BK2:
- R-G03: Si politicaNumeracion = UNICA, no puede haber 2 participantes con el mismo
  numero en el mismo grupo. 01_constraints.sql ya lo rechaza en Postgres.
- R-K01: Genero (HOMBRE/MUJER/NINO/NINA) + Corte de prenda + Cuello.
  Son 3 campos separados en el modelo Prenda.
- R-K02: TipoPrenda = OBSEQUIO o MUESTRA se fabrica pero no se cobra.
- R-D05: Los participantes se registran sin cuenta de usuario (enlace firmado).

---

## FASE 4 - Frontend (Next.js)  PENDIENTE

### Stack: Next.js (puerto 3000) consumiendo BK1 en localhost:3001

### Pantallas planificadas:
- [ ] Listado de Pedidos (vista principal)
- [ ] Crear Pedido (wizard: datos generales > grupos > colores)
- [ ] Detalle de Pedido (grupos, colores, estado, resumen)
- [ ] Formulario de Participantes (vinculo externo, sin login)

---

## FASE 5 - Integracion GoHighLevel (GHL)  OPCIONAL / FUERA DE ALCANCE

### Campo pendiente: ghlContactId en modelo Cliente (actualmente null).
### No se realizara por ahora.

---

## COMO INICIAR EL BACKEND (comandos)

```bash
cd C:/Users/Santiago/Downloads/sublitex/RptSoft-Sublitex/Backend

# Primera vez o al cambiar schema.prisma:
npx prisma migrate dev

# Todas las sesiones:
npm run start:dev

# Tests:
npm test

# Build:
npm run build

# Swagger: http://localhost:3001/api/docs
```
