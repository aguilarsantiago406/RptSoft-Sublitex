# Estructura del frontend — Sprint 1

## Objetivo

Construir el flujo operativo de pedidos sobre Next.js y el backend NestJS real. La aplicación no contiene datos simulados.

---

## Comportamiento de navegación: dos sidebars

La app tiene **dos sidebars distintos** que se reemplazan mutuamente.

### 1. Sidebar principal (`MainSidebar`)

Visible en todas las rutas del dashboard excepto cuando se está dentro de un pedido.
Contiene los módulos globales: Pedidos, Clientes, Producción, Catálogos, Usuarios, etc.

### 2. Sidebar contextual de pedido (`PedidoSidebar`)

Cuando el usuario navega a `/pedidos/[id]` o cualquier sub-ruta de un pedido específico,
el sidebar principal **se reemplaza completamente** por este sidebar contextual.

Contiene únicamente:
- **DATOS DEL PEDIDO** — datos generales del pedido
- **PRENDAS** — gestión de prendas del pedido
- **PROFORMA** — vista / generación de proforma

> El reemplazo es visual y de navegación: el `AppShell` detecta si la ruta activa
> pertenece al contexto de un pedido y renderiza el sidebar correspondiente.

### Implementación sugerida

```
components/layout/
├── AppShell.tsx          # Decide qué sidebar renderizar según la ruta
├── MainSidebar.tsx       # Sidebar global (módulos del sistema)
├── PedidoSidebar.tsx     # Sidebar contextual (DATOS DEL PEDIDO · PRENDAS · PROFORMA)
├── Topbar.tsx
└── layout.module.css
```

Lógica en `AppShell.tsx`:

```ts
// Si la ruta activa empieza con /pedidos/[id], renderiza PedidoSidebar
// En cualquier otro caso, renderiza MainSidebar
const isPedidoContext = /^\/pedidos\/[^/]+/.test(pathname);
```

---

## Árbol principal

```text
src/
│
├── app/                     # Páginas y navegación
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/         # Páginas con sidebar
│   │   ├── layout.tsx       # Shell privado — monta AppShell
│   │   ├── page.tsx         # Entrada: redirige a /pedidos
│   │   │
│   │   ├── pedidos/
│   │   │   ├── page.tsx              # Lista — MainSidebar activo
│   │   │   ├── loading.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/                 # PedidoSidebar activo en todas estas rutas
│   │   │       ├── page.tsx          # DATOS DEL PEDIDO
│   │   │       ├── editar/
│   │   │       │   └── page.tsx
│   │   │       ├── grupos/
│   │   │       │   └── page.tsx
│   │   │       └── prendas/
│   │   │           └── page.tsx      # PRENDAS
│   │   │
│   │   ├── clientes/
│   │   │   ├── page.tsx
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── produccion/
│   │   │   ├── page.tsx
│   │   │   └── [pedidoId]/
│   │   │       └── page.tsx
│   │   │
│   │   ├── catalogos/
│   │   │   └── page.tsx
│   │   │
│   │   └── usuarios/
│   │       └── page.tsx
│   │
│   ├── participante/
│   │   └── [token]/
│   │       └── page.tsx     # Formulario público por enlace (sin sidebar)
│   │
│   ├── error.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Orquestador: elige qué sidebar mostrar
│   │   ├── MainSidebar.tsx     # Sidebar global (módulos del sistema)
│   │   ├── PedidoSidebar.tsx   # Sidebar contextual del pedido
│   │   ├── Topbar.tsx
│   │   └── layout.module.css
│   │
│   └── ui/                  # Componentes reutilizables
│       ├── Button.tsx
│       ├── DataTable.tsx
│       ├── EmptyState.tsx
│       ├── ErrorMessage.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       └── Spinner.tsx
│
├── features/                # Módulos del negocio
│   ├── pedidos/
│   │   ├── api/
│   │   │   └── pedidos.api.ts
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── clientes/
│   │   ├── api/
│   │   ├── components/
│   │   ├── schemas/
│   │   └── types/
│   ├── grupos/
│   │   ├── api/
│   │   ├── components/
│   │   ├── schemas/
│   │   └── types/
│   ├── participantes/
│   │   ├── api/
│   │   ├── components/
│   │   ├── schemas/
│   │   └── types/
│   ├── prendas/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   └── types/
│   ├── produccion/
│   │   ├── api/
│   │   ├── components/
│   │   └── types/
│   ├── catalogos/
│   │   ├── api/
│   │   └── types/
│   └── auth/
│       ├── api/
│       ├── components/
│       └── types/
│
├── lib/
│   ├── api/
│   │   └── http.ts          # Cliente HTTP único al backend NestJS
│   ├── auth/
│   │   └── session.ts
│   ├── format/
│   │   ├── date.ts
│   │   ├── money.ts
│   │   └── text.ts
│   └── validation/
│       └── api-error.ts
│
├── config/
│   ├── env.ts
│   ├── navigation.ts
│   └── routes.ts
│
└── types/
    └── common.ts
```

---

## Regla de integración

- `app` coordina rutas y estados de página.
- `features` contiene la lógica de cada módulo.
- `lib/api` es el único punto que conoce `SIPES_API_URL`.
- No se agregan objetos estáticos para reemplazar respuestas del backend.
- Los módulos futuros del sidebar permanecen deshabilitados hasta tener alcance de Sprint.
- El sidebar que se muestra es **responsabilidad de `AppShell`**, no de cada página.

---

## Orden de trabajo del Sprint 1

1. Lista de pedidos y filtros.
2. Detalle del pedido — activa `PedidoSidebar` con las 3 secciones.
3. Creación de pedido contra `POST /api/pedidos`.
4. Sub-ruta `/pedidos/[id]/prendas` — gestión de prendas.
5. Sub-ruta `/pedidos/[id]/proforma` — vista de proforma.
6. Estados de carga, vacío, error y validaciones de negocio.

---

## Endpoints ya conectados

- `GET /api/pedidos`
- `GET /api/pedidos/:id`

El resto se agrega dentro de `features/<modulo>/api` conforme se implementa cada pantalla.
