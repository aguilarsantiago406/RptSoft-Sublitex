# AGENTS.md — SIPES (RptSoft-Sublitex)

Guía para agentes de IA que trabajan en este repositorio.

## Descripción del proyecto

**SIPES** — Sistema de Gestión Operativa de Pedidos para Sublitex (confección deportiva/escolar por sublimación digital). La prenda es la unidad contable, ningún total se escriba a mano.

## Estructura

- `README.md` — Documentación general y reglas de negocio (Leer primero).
- `Backend/` — API RESTful. **NestJS + Prisma + PostgreSQL + TypeScript**.
  - `prisma/schema.prisma` — Modelo de datos (26 entidades). Cada modelo referencia reglas (`R-XXX`).
  - `prisma/constraints.sql` — Triggers/restricciones críticas (NO borrar: el schema no basta solo). También vive en migraciones SQL.
  - `src/main.ts` — Bootstrap: CORS, ValidationPipe global, PrismaExceptionFilter, Swagger en `/api/docs`.
  - `src/app.module.ts` — Agrega los 5 módulos de dominio.
  - `src/core/` — `prisma/` (PrismaModule @Global + PrismaService) y `filters/prisma-exception.filter.ts`.
  - `src/modules/` — Frentes por dominio funcional:
    - `1-nucleo-comercial/` — auth, clientes, pedidos, grupos, catálogos, tarifas.
    - `2-operacion-prendas/` — participantes, prendas, excepciones, personalizaciones (corazón operativo).
    - `3-diseno/`, `4-taller-produccion/`, `5-auditoria/` — versionado gráfico, producción y trazabilidad.

## Comandos (ejecutar desde `Backend/`)

```bash
npm install            # instala + prisma generate automático
npm run start:dev      # servidor en modo watch (puerto $PORT o 3000)
npm run build          # compila a dist/
npm run lint           # ESLint con --fix (correr tras cada cambio)
npm run format         # Prettier
npm run test           # Jest (unit, *.spec.ts en src/)
npm run test:e2e       # supertest (test/jest-e2e.json)
npx prisma generate    # regenerar cliente Prisma tras cambios en schema
npx prisma migrate dev # aplicar migraciones (requiere PostgreSQL activo)
```

## Convenciones

- **Idioma**: el código, DTOs y mensajes están en **español** (nombres de campos/entidades en inglés, mensajes de error en español).
- **Patrón Nest por módulo**: `modulo.module.ts` + `*.controller.ts` + `*.service.ts` + `dto/*.dto.ts` con `class-validator`.
- Cada controller usa `@ApiTags` / `@ApiOperation` de `@nestjs/swagger`.
- Las reglas de negocio se referencian por ID (`R-E07`, `R-K03`, `R-G03`, `R-D03`, `R-C05`, `R-I01`, `R-K10`, ...). Buscar el ID antes de modificar lógica relacionada.
- La auditoría es append-only: usar `registroCambio` (Prisma) antes de crear/editar/eliminar entidades de negocio.
- El `ValidationPipe` global usa `whitelist + transform + forbidNonWhitelisted`: los DTOs deben declarar explícitamente todos los campos permitidos.
- No usar estados hardcodeados sueltos: respetar los enums de `schema.prisma` (ej. `estado` de Participante: `PENDIENTE → REGISTRADO → CONFIRMADO`).
- No agregar comentarios al código salvo que se pida. Corre `npm run lint` después de tocar TypeScript.