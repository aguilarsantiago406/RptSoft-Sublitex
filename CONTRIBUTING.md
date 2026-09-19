# Guía de Contribución y Flujo de Trabajo (OpenSpec)

En **SIPES** trabajamos bajo la metodología **Spec-Driven Development (SDD)** con OpenSpec. Esto significa que ningún cambio de comportamiento o funcionalidad se implementa directamente en el código sin antes haber sido especificado y validado.

---

## La Regla de Oro

> **Nunca se editan los archivos de `openspec/specs/` manualmente.**  
> Los archivos en `openspec/specs/` representan la verdad viva y vigente del sistema. Cualquier modificación se realiza mediante un ciclo formal de cambio (*change*) y fusión (*archive*).

---

## Flujo de Trabajo en 3 Pasos

```
[ 1. Consultar ]                 [ 2. Proponer ]                   [ 3. Implementar y Cerrar ]
openspec/specs/       ──>  openspec new change <nombre>  ──>  openspec archive <nombre>
(Entender la regla)         (proposal, delta spec, tasks)      (Fusión a specs + commit)
```

### Paso 1: Consultar la Especificación Vigente
Antes de diseñar una solución o escribir código, revisa la carpeta [`openspec/specs/`](openspec/specs/) para entender cómo funciona la capacidad afectada:
- `pedidos/spec.md`: Reglas de la lista de pedidos, filtros y estados.
- `detalle-pedido/spec.md`: Ficha técnica comercial, diseño aprobado, colores y envío.
- `prendas/spec.md`: Grilla de 26 columnas, dorsales, excepciones de corte y ficha mínima.
- `proforma/spec.md`: Cotización, recargos y adelanto sugerido.
- `catalogos/spec.md`: Catálogos, piezas físicas de corte y parámetros comerciales.
- `integracion-bk2/spec.md`: Contrato de API, simulador y validación estricta de DTOs.

### Paso 2: Proponer el Cambio
Crea un nuevo cambio aislado. Puedes hacerlo de dos formas:

#### Opción A: Con Asistente de IA (Cursor, Codex, Gemini CLI, Claude)
Indícale al asistente:
> *"Quiero proponer un cambio para [descripción del cambio] usando OpenSpec"*  
> (o ejecuta el comando `/opsx:propose [descripción]`).

#### Opción B: Mediante Terminal
```bash
openspec new change nombre-del-cambio
```

Esto generará la carpeta `openspec/changes/nombre-del-cambio/` con cuatro artefactos:
1. `proposal.md`: Justificación de negocio y alcance del cambio.
2. `specs/<capacidad>/spec.md`: El **Delta Spec** declarando:
   - `ADDED`: Nuevos requerimientos funcionales y escenarios.
   - `MODIFIED`: Modificaciones sobre requerimientos existentes.
   - `REMOVED`: Requerimientos dados de baja.
3. `design.md`: Decisiones técnicas de arquitectura y alternativas evaluadas.
4. `tasks.md`: Lista secuencial y atómica de tareas de implementación.

Valida que la propuesta esté completa:
```bash
openspec validate nombre-del-cambio
```

### Paso 3: Implementar, Verificar y Archivar

1. **Implementar las tareas**: Realiza los cambios dentro de `sublitex-web/` siguiendo estrictamente el checklist en `tasks.md`.
2. **Verificar**: Todos los tests y verificaciones deben pasar en verde:
   ```bash
   cd sublitex-web
   npm test        # Vitest: pruebas unitarias y de integración
   npm run lint    # ESLint
   npm run build   # Compilación de producción Next.js
   ```
3. **Archivar el cambio**: Una vez completadas todas las tareas de `tasks.md`:
   ```bash
   openspec archive nombre-del-cambio
   ```
   Este comando toma los deltas y los **fusiona automáticamente** en `openspec/specs/`, archivando el cambio en `openspec/changes/archive/`.

---

## Convenciones de Código y Ramas

- **Código limpio**: Todo el código de la aplicación reside en `sublitex-web/`. La lógica de negocio pura vive en `src/domain/` y no depende de React.
- **Precios derivados**: Los precios siempre se calculan mediante tarifas (`base + recargos`). Jamás se escribe un monto a mano.
- **Commits**: Usar Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`). No incluir atribuciones de IA.
- **Ramas**: Crear ramas con prefijo (`feat/...`, `frontend/...`, `fix/...`) y proponer cambios hacia `develop` mediante Pull Request.
