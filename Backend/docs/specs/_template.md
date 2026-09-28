# Spec — Módulo `[nombre-modulo]`

## Propósito

[Una línea: qué hace este módulo y por qué existe.]

**Sala / Equipo responsable:** [Sala X]  
**Módulos que dependen de este:** [lista de módulos consumidores]  
**Módulos de los que depende:** [lista de módulos proveedores]

---

## Entidades

### `[nombre_tabla]`

| Campo | Tipo | Constraints | Notas |
|---|---|---|---|
| `id` | uuid | PK, NOT NULL | Generado por backend |
| `[campo]` | [tipo] | [NOT NULL / NULL / UNIQUE] | [nota si es contrato crítico] |
| `[campo_enum]` | enum('[VAL1]','[VAL2]') | NOT NULL | Valores exactos — no cambiar |
| `[campo_fk]` | uuid | FK → [tabla].[campo] | [HARD: ON DELETE RESTRICT / SOFT: sin constraint] |
| `deletedAt` | timestamptz | NULL | Soft delete — nunca hard delete |
| `createdAt` | timestamptz | NOT NULL | — |
| `updatedAt` | timestamptz | NOT NULL | — |

**Índices obligatorios:**
- `[nombre_indice]` ON `([campo])` [WHERE condición opcional]
- `[nombre_indice_unico]` UNIQUE ON `([campo])` [WHERE condición opcional]

---

## Endpoints

| Método | Path | Roles | HTTP Success | Notas |
|---|---|---|---|---|
| POST | `/[recurso]` | [ROL1, ROL2] | 201 | [nota si aplica] |
| GET | `/[recurso]` | [ROL1] | 200 | [nota] |
| GET | `/[recurso]/:id` | [ROL1] | 200 | [nota] |
| PATCH | `/[recurso]/:id` | [ROL1] | 200 | [nota] |
| DELETE | `/[recurso]/:id` | [ROL1] | 204 | Soft delete |

**Endpoints prohibidos (no deben existir):**
- `[MÉTODO] /[path]` — [razón por la que está prohibido]

---

## DTOs

### `Create[Entidad]Dto`
```typescript
{
  [campo]: [tipo]           // @Is[Decorador]() — [restricción]
  [campo]: [tipo] | null    // @IsOptional() @Is[Decorador]()
}
```

### `Update[Entidad]Dto`
```typescript
{
  [campo]?: [tipo]          // @IsOptional() @Is[Decorador]()
}
```

### `[Entidad]ResponseDto`
```typescript
{
  [campo]: [tipo]           // [nota si es contrato con otro módulo]
  [campo]: [tipo] | null
}
```

---

## Reglas de Negocio

### Restricciones absolutas (nunca cambiar)
- SIEMPRE [regla obligatoria con consecuencia si se ignora]
- NUNCA [prohibición con consecuencia si se ignora]
- SI [condición rota] → consecuencia observable: [qué falla exactamente]

### Máquina de estados (si aplica)
```
[Estado A] ──► [Estado B] ──► [Estado C] (TERMINAL)
     │
     └──► [Estado D]
```

| Estado actual | Transiciones permitidas |
|---|---|
| `[Estado A]` | `[Estado B]`, `[Estado D]` |
| `[Estado B]` | `[Estado C]` |
| `[Estado C]` | *(ninguno — terminal)* |

### Race conditions (si aplica)
- [Escenario de concurrencia] → proteger con [transacción / unique constraint / lock]
- Responder HTTP [409/422] si colisión detectada

---

## Contratos que Expone

> Estos campos/endpoints son garantías para otros módulos. **No cambiar sin coordinar.**

| Campo / Endpoint | Consumidor | Tipo | Garantía |
|---|---|---|---|
| `[campo]` | [Módulo/Sala X] | [tipo exacto] | [qué garantiza — ej. nombre inmutable, siempre expuesto] |
| `[endpoint]` | [Módulo/Sala Y] | [método] | [qué garantiza] |

---

## Contratos que Consume

> Estos campos/endpoints son dependencias de otros módulos. Si cambian, este módulo falla.

| Campo / Endpoint | Proveedor | Tipo esperado | Riesgo si cambia |
|---|---|---|---|
| `[campo]` | [Módulo/Sala X] | [tipo] | [consecuencia observable si falta o cambia] |
| `[endpoint]` | [Módulo/Sala Y] | [método] | [consecuencia] |

**Protocolo de bloqueo:** Si falta un contrato crítico externo, detener implementación y emitir issue con: endpoint esperado, shape requerido, impacto.

---

## Seguridad y Auditoría

- [Regla de acceso por rol — quién puede leer, quién puede escribir]
- [Qué campos son PHI / sensibles y cómo se manejan en logs]
- [Qué acciones se registran en AuditLog]
- [Qué rol NO puede hacer en este módulo]

---

## Migración [Versión Anterior] → [Versión Actual] (si aplica)

- DEBES [acción de migración]
- NUNCA [acción prohibida durante migración]
- SI [acción rota] → consecuencia observable: [qué se rompe]

---

## Tareas de Implementación

- [ ] [Tarea 1 — concreta y verificable]
- [ ] [Tarea 2 — concreta y verificable]
- [ ] [Tarea 3 — crear migración para X]
- [ ] Test: [escenario exacto que debe pasar]
- [ ] Test: [escenario exacto que debe pasar]

<!--
GUÍA DE USO — MODULE SPEC

Este archivo es la guía operativa de un agente o equipo para construir UN módulo.
Debe ser autocontenido: el lector no debería necesitar leer otros archivos para implementar.

Secciones obligatorias:    Propósito, Entidades, Endpoints, Reglas de Negocio, Tareas
Secciones condicionales:   Contratos (si hay dependencias inter-módulo), Migración (si es refactor)
Secciones opcionales:      Máquina de estados, Race conditions, PHI/Seguridad

Reglas de redacción:
- Nombres de campos = nombre exacto en base de datos (snake_case)
- Nombres de campos en DTO = camelCase
- Tipos en entidades = tipos de PostgreSQL
- Tipos en DTOs = tipos de TypeScript
- Siempre incluir el HTTP code exacto de cada endpoint
- Prohibiciones escritas como: "NUNCA [acción] → consecuencia: [qué falla]"
-->
