# Estructura del frontend — Sprint 1

## Objetivo

Construir el flujo operativo de pedidos sobre Next.js y el backend NestJS real. La aplicación no contiene datos simulados.

## Árbol principal

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Shell privado con sidebar
│   │   ├── page.tsx            # Entrada: redirige a pedidos
│   │   └── pedidos/
│   │       ├── page.tsx        # GET /api/pedidos
│   │       └── [id]/page.tsx   # GET /api/pedidos/:id
│   ├── error.tsx               # Recuperación ante fallos
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   └── layout/                 # Sidebar y shell responsive
├── features/
│   └── pedidos/
│       ├── api/                # Operaciones del módulo
│       ├── components/         # UI propia de pedidos
│       └── types/              # Contratos de pedidos
└── lib/
    ├── api/                    # Cliente HTTP único al backend
    └── format/                 # Formatos compartidos
```

## Regla de integración

- `app` coordina rutas y estados de página.
- `features` contiene la lógica de cada módulo.
- `lib/api` es el único punto que conoce `SIPES_API_URL`.
- No se agregan objetos estáticos para reemplazar respuestas del backend.
- Los módulos futuros del sidebar permanecen deshabilitados hasta tener alcance de Sprint.

## Orden de trabajo del Sprint 1

1. Lista de pedidos y filtros.
2. Detalle del pedido, grupos, colores y configuración base.
3. Creación de pedido contra `POST /api/pedidos`.
4. Gestión de grupos y política de numeración.
5. Participantes y prendas usando los endpoints reales de BK2.
6. Estados de carga, vacío, error y validaciones de negocio.

## Endpoints ya conectados

- `GET /api/pedidos`
- `GET /api/pedidos/:id`

El resto se agrega dentro de `features/<modulo>/api` conforme se implementa cada pantalla.
