# AGENTS.md — Contexto para Agentes de IA

> Este archivo le indica a OpenCode, Claude, Cursor, Copilot y otros agentes
> cómo trabajar en el proyecto SIPES. **Léelo completo antes de hacer cambios.**

---

## 🎯 ¿Qué es SIPES?

**SIPES** (*Sistema de Información y Pedidos para la Empresa Sublitex*) es un sistema
de gestión operativa para una fábrica de camisetas y prendas deportivas
personalizadas por sublimación digital.

**Empresa:** Sublitex (APM Inversiones E.I.R.L.)
**Problema:** Los pedidos se gestionan manualmente con WhatsApp, Excel y CorelDRAW,
causando errores de digitación, duplicidad y pérdida de información.

**Solución:** Un backend NestJS + Prisma + PostgreSQL que centraliza todo el pedido
en una **única fuente de verdad**.

**Principio fundamental:**
> *"Garantizar que la PRENDA (no la persona) sea la unidad física contable
> y que ningún total se escriba nunca a mano."*

---

## 🏛️ Arquitectura del Repositorio

```text
RptSoft-Sublitex/
├── README.md
├── AGENTS.md                     ← este archivo
├── .github/workflows/ci.yml      ← CI con GitHub Actions (dentro de Backend/)
└── Backend/                      ← NestJS + Prisma + PostgreSQL
    ├── prisma/
    │   ├── schema.prisma         ← 26 entidades (NO TOCAR sin coordinar)
    │   └── constraints.sql       ← Triggers SQL (R-G03, R-G06, R-H12, R-C05, R-I02, R-K05)
    └── src/
        ├── core/
        │   ├── prisma/           ← PrismaModule (@Global) y PrismaService
        │   └── filters/          ← PrismaExceptionFilter
        ├── main.ts               ← Bootstrap + Swagger
        └── modules/
            ├── 1-nucleo-comercial/   ← FRENTE BK1: Pedido, Cliente, Catálogos, Grupo, Tarifa, auth (JWT)
            ├── 2-operacion-prendas/  ← FRENTE BK2: Participantes, Prendas, Excepciones, Personalizaciones
            ├── 3-diseno/             ← FRENTE DISEÑO: Versionado y aprobación gráfica
            ├── 4-taller-produccion/  ← FRENTE PRODUCCIÓN: Nesting, corte, archivos TIF
            └── 5-auditoria/          ← FRENTE AUDITORÍA: Trazabilidad inmutable
```

---

## 🎨 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | NestJS 11 |
| **Lenguaje** | TypeScript 5.9 |
| **ORM** | Prisma 6.19 |
| **Base de datos** | PostgreSQL 16 |
| **Autenticación** | JWT (personal) + enlace token (participantes) |
| **Docs API** | Swagger (`http://localhost:3000/api/docs`) |
| **Testing** | Jest (unit + e2e) |
| **CI/CD** | GitHub Actions |
| **Node** | 20 o superior |

---

## 🛡️ Reglas de Negocio Esenciales

Estas reglas están codificadas en `schema.prisma` y `constraints.sql`.
**DEBES respetarlas en cualquier cambio.**

### R-E01 / R-E07 · La Prenda es la unidad contable

- Una persona (Participante) puede tener **múltiples prendas**
  (ej: un jugador con camiseta titular + camiseta de arquero).
- **TODOS los resúmenes se calculan sobre `Prenda`, nunca sobre `Participante`.**

### R-K03 · Conteo por piezas físicas

- Cada `TipoProducto` declara `camisetas`, `shorts`, `medias`.
- El resumen de producción **multiplica** cada prenda por estas piezas.
- **Nunca** contar pedidos ni "unidades" directamente.

### R-K04 · El número de prenda es TEXTO

- El campo `numero` admite `"S/N"` (sin número) o texto como `"10"`.
- **No es entero.** `"S/N"` es válido y distinto de `null`.

### R-K02 · Obsequio y muestra

- `VENTA`, `OBSEQUIO`, `MUESTRA` son tipos de prenda.
- Obsequio y muestra **se fabrican pero NO se cobran** (importe = 0).

### R-G01 / R-G03 · Política de numeración

- `LIBRE` (default): varios participantes pueden tener el mismo número.
- `UNICA`: un número solo puede asignarse a una prenda por grupo.
- El trigger SQL valida esto. **No lo reimplementes en TypeScript.**

### R-C01 / R-C05 · Excepciones delta

- Las excepciones guardan **solo la diferencia** respecto al grupo.
- Una excepción **idéntica al valor general del grupo es inválida**.
- El trigger SQL lo valida.

### R-K05 · Colores con código HEX

- Un color **NO es solo un nombre**. Debe tener `codigoHex` (#RRGGBB).
- El trigger SQL rechaza diseños con colores sin HEX.

### R-I01 a R-I05 · Auditoría append-only

- **Cada cambio** debe registrarse en `RegistroCambio`.
- Los permisos de UPDATE y DELETE están revocados.
- Atribuir a `USUARIO` o `PARTICIPANTE` según origen.

### R-H01 / R-H02 · Bloques de cierre

- Los pedidos tienen 3 bloques: `DISENO`, `LISTA`, `COMERCIAL`.
- **No se cierra Diseño sin un diseño APROBADO.**
- Al cerrar se congela una versión inmutable.

### R-K10 · Precios desde Tarifa

- **Ningún precio se escribe a mano.**
- Siempre sale de la tabla `Tarifa` con vigencia.

---

## 🔧 Convenciones de Código

### Nomenclatura

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos | `kebab-case` | `prendas.service.ts` |
| Clases | `PascalCase` | `PrendasService` |
| Métodos | `camelCase` | `calcularPrecio()` |
| DTOs | `PascalCase` + `Dto` | `CreatePrendaDto` |
| Modelos Prisma | `PascalCase` singular | `Prenda`, `Participante` |
| Tablas PostgreSQL | `PascalCase` singular | `Prenda`, `Participante` |

### Estructura de módulos

```text
<modulo>/
├── <modulo>.module.ts
├── <modulo>.controller.ts
├── <modulo>.service.ts
└── dto/
    ├── create-<entidad>.dto.ts
    ├── update-<entidad>.dto.ts
    └── ...
```

### Servicios

- **Siempre** usar `PrismaService` inyectado.
- **Siempre** envolver operaciones con auditoría en `transaction`.
- **Siempre** lanzar excepciones específicas:
  - `NotFoundException` — recurso no existe
  - `BadRequestException` — datos inválidos
  - `ConflictException` — duplicado
  - `GoneException` — enlace expirado/revocado

### Controllers

- **Siempre** usar `@ApiTags` y `@ApiOperation` para Swagger.
- Los endpoints privados deben tener `@UseGuards(JwtAuthGuard)`.
- Los endpoints públicos (por token) van en `<modulo>-public.controller.ts`.

### DTOs

- **Siempre** usar `class-validator` (`@IsString`, `@IsOptional`, etc.).
- **Siempre** documentar con `@ApiProperty` o `@ApiPropertyOptional`.

---

## ✅ Lo que SÍ debes hacer

- ✅ Leer `schema.prisma` antes de tocar cualquier modelo.
- ✅ Consultar `constraints.sql` antes de agregar validaciones.
- ✅ Usar transacciones para operaciones con auditoría.
- ✅ Registrar cada cambio en `RegistroCambio` (R-I01).
- ✅ Respetar el ciclo de vida de los estados.
- ✅ Escribir tests antes de commitear.
- ✅ Correr `npm run lint` y `npm run build` antes de push.
- ✅ Usar `@UseGuards(JwtAuthGuard)` en endpoints privados.
- ✅ Verificar el CI en GitHub después del push.

---

## ❌ Lo que NO debes hacer

- ❌ **NO** modificar `schema.prisma` sin coordinar con BK1.
- ❌ **NO** escribir precios hardcodeados (R-K10).
- ❌ **NO** contar sobre `Participante` en vez de `Prenda` (R-E07).
- ❌ **NO** crear usuarios para participantes (R-D05).
- ❌ **NO** permitir cambiar `numero` si el participante está `CONFIRMADO` (R-D03).
- ❌ **NO** borrar registros de auditoría (R-I02).
- ❌ **NO** duplicar lógica de los triggers SQL en TypeScript.
- ❌ **NO** usar `any` sin justificación.
- ❌ **NO** commitear a `main` sin que el CI pase.
- ❌ **NO** tocar módulos fuera de tu frente.

---

## 🎯 Frentes de Trabajo

### 🛡️ BK1 — Núcleo Comercial
**Responsabilidad:** Pedido base, clientes, catálogos, tarifas, bloques, autenticación JWT.
**Módulos:** `1-nucleo-comercial/`
**NO TOCAR por otros frentes.**

### ⚙️ BK2 — Operación Prendas
**Responsabilidad:** Participantes, prendas, excepciones, personalizaciones.
**Módulos:** `2-operacion-prendas/`
**Endpoints base:** `/api/grupos/:grupoId/participantes`, `/api/prendas`, `/api/excepciones-prenda`, `/api/personalizaciones`

### 🎨🖨️🔍 BK3 — Diseño, Producción y Auditoría
**Responsabilidad:** Versionado/aprobación gráfica, nesting y corte, trazabilidad inmutable.
**Módulos:** `3-diseno/`, `4-taller-produccion/`, `5-auditoria/`
**Endpoints base:** `/api/disenos`, `/api/pedidos/:pedidoId/disenos`, `/api/nestings`, `/api/nesting-partes`, `/api/archivos-tif`, `/api/registros-cambio` *(este último pendiente de implementar: el módulo es actualmente un esqueleto)*

---

## 🔄 Flujo de Trabajo con Git

### Ramas

| Rama | Propósito |
|------|-----------|
| `main` | Producción (protegida) |
| `develop` | Integración (protegida) |
| `feature/<nombre>` | Nuevas funcionalidades |
| `fix/<nombre>` | Correcciones |
| `wip/<nombre>` | Trabajo en progreso (no bloquea) |

### Convención de commits

```text
<tipo>(<scope>): <descripción>

feat(bk2): agregar validación R-G03 en crear prenda
fix(diseno): corregir transición de estado
docs(api): documentar endpoints de participantes
test(prendas): agregar tests de calcularPrecio
refactor(participantes): extraer lógica de validación
chore(ci): actualizar Node a 22
```

### Flujo

1. Crear rama desde `develop`: `git checkout -b feature/nueva-funcionalidad`
2. Implementar + tests
3. `npm run lint && npm run build`
4. Commit con convención
5. Push: `git push origin feature/nueva-funcionalidad`
6. Crear Pull Request a `develop`
7. Esperar CI verde
8. Merge

---

## 🧪 Testing

### Tests Unitarios

```text
npm test
Nombre: src/**/*.spec.ts
Framework: Jest
Mockear PrismaService siempre.
```

### Tests E2E

```text
npm run test:e2e
Nombre: test/**/*.e2e-spec.ts
Config: test/jest-e2e.json
Usa PostgreSQL de test.
```

---

## 🚀 Comandos Útiles

```text
# Instalar
npm install

# Prisma
npx prisma generate       # Generar cliente
npx prisma validate       # Validar schema
npx prisma migrate dev    # Aplicar migraciones (dev)
npx prisma migrate deploy # Aplicar migraciones (CI/prod)
npx prisma studio         # UI de la BD

# Desarrollo
npm run start:dev         # Arrancar con watch
npm run start:debug       # Arrancar con debugger
npm run build             # Compilar
npm run lint              # Linter

# Testing
npm test                  # Unit
npm run test:e2e          # E2E
npm run test:cov          # Coverage
```

---

## 📚 Documentación de Referencia

- **Requerimiento funcional:** Requerimiento funcional y técnico.txt
- **Schema:** `Backend/prisma/schema.prisma`
- **Constraints SQL:** `Backend/prisma/constraints.sql`
- **Swagger:** `http://localhost:3000/api/docs`
- **README:** `README.md`

---

## 🆘 Si tienes dudas

- Lee primero `schema.prisma` — ahí está todo.
- Busca la regla (R-XXX) en `constraints.sql`.
- Pregunta antes de modificar modelos compartidos.
- Usa Plan Mode antes de Build Mode.

---

## 🎯 Objetivo Final

> *"Que un pedido pueda pasar desde GoHighLevel hasta producción
> sin que una persona tenga que volver a copiar manualmente
> los nombres, números, tallas y cantidades."*

El indicador de éxito es:

> ¿Cuántas veces tuvo que volver a escribir una persona un dato que ya estaba registrado?

**Objetivo: UNA SOLA VEZ.**

---

*Última actualización: 23/09/2026*
*Versión del schema: v0.2 + bloque K*