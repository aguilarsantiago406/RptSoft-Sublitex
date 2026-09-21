# sublitex-web — Frontend de gestión de pedidos

Frontend de **SIPES** (Sistema de Pedidos de Sublitex): listado de pedidos, detalle de
pedido y la grilla de prendas con precios por recargo. Es una **SPA construida con
Next.js 16 (App Router)** que consume la API real del backend NestJS (RptSoft-Sublitex)
— **ya no usa mocks**.

## Stack

| Capa        | Tecnología                              |
| ----------- | --------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)      |
| UI          | React 19                                |
| Lenguaje    | TypeScript (strict)                     |
| Estilos     | CSS Modules + variables CSS (`globals.css`) |
| Testing     | Vitest (funciones puras de `src/domain`) |

## Cómo correrla

```bash
npm install
npm run dev        # desarrollo (http://localhost:3000)
npm run build      # build de producción
npm start          # sirve el build (usar con el backend levantado)
npm test           # tests de dominio (vitest)
```

La app espera el backend en `http://localhost:3001` (se puede cambiar con la
variable de entorno `NEXT_PUBLIC_BACKEND_URL`). El acceso requiere login
(`/login`) contra `POST /api/auth/login` del backend.

## Estructura de carpetas

```
src/
├── app/                  # Rutas (App Router)
│   ├── layout.tsx        # Layout raíz: <html> + fuentes + estilo global
│   ├── globals.css       # ÚNICO lugar con variables de diseño (paleta, radios, sombras)
│   ├── login/            # Pantalla de login (sin sidebar)
│   └── (app)/            # Route group con sesión: sidebar + guard de login
│       ├── layout.tsx    # Guard: sin token redirige a /login; renderiza <Sidebar>
│       ├── page.tsx      # Redirige / → /pedidos
│       └── pedidos/      # Lista de pedidos + detalle /pedidos/[id]
├── components/           # Componentes de UI
│   ├── layout/Sidebar    # Navegación corporativa + "Cerrar sesión"
│   ├── pedidos/          # EstadoBadge
│   └── prendas/          # Grilla: TablaPrendas, PanelEstadoGrupo, TarjetaParticipante,
│                         #   TotalesPrendas, CeldaEditable, FilaAtributos, FilaPrecio
├── services/             # Capa HTTP contra el backend (apiClient + endpoints)
├── hooks/                # Estado de pantalla acoplado a services (usePedidoDetalle, useGrupoPrendas)
├── domain/               # Lógica pura SIN React ni fetch (cálculos, resumen, validación)
├── types/                # Tipos de dominio y "shapes crudos" del backend
└── utils/logger.ts       # Mini-logger legible (sin dependencias)
```

## Cómo fluyen los datos

```
Página (app/(app)/pedidos, [id])
  → hooks (usePedidoDetalle, useGrupoPrendas)   [estado + ciclo de vida]
    → services (pedidosApi, prendasApi, catalogosApi, tarifasApi)
      → apiClient.api(path, init)                [fetch + Authorization + errores]
        → Backend NestJS en http://localhost:3001
```

### Capa por capa

- **`app/(app)/layout.tsx`** — guard de sesión en el cliente: si no hay token JWT en
  `localStorage` (clave `sipes_token`), redirige a `/login`. Con sesión renderiza el
  shell (sidebar + contenido).
- **`services/apiClient.ts`** — el único lugar que hace `fetch`. Agrega
  `Authorization: Bearer <token>`, deserializa `{ message }` del backend y lanza
  `Error` con ese mensaje. En `401` (sesión vencida) limpia el token y vuelve a `/login`.
- **`services/*Api.ts`** — un service por recurso del backend. Transforman la forma
  **cruda del API** (ids sueltos) a los **tipos de dominio** que usa la UI. Ejemplo:
  `prendasApi` resuelve `tipoProductoId`/`tallaId` contra los índices del catálogo.
- **`hooks/`** — acoplan los services a las pantallas: ordenan las llamadas
  (`Promise.all`), manejan loading/error y guardan en `useState`.
- **`domain/`** — funciones puras (sin fetch ni React): cálculo de precios con
  recargos (`calculoPrecios`), resumen por producto (`resumenGrupo`), BOM/componentes
  (`calculoPiezas`) y validación de prenda completa (`validacionPrenda`). Estas
  funciones tienen tests.
- **`types/`** — `pedidos.ts` y `prendas.ts` declaran el modelo de dominio + los
  "raw shapes" del API cuando hace falta.

## Catálogo y resolución de ids

El backend entrega **ids crudos** (`tipoProductoId`, `tallaId`, `atributoId`,
`valorAtributoId`, `ubicacionId`) en las prendas. La UI trabaja con **códigos**
(`T-01`, talla `M`, ubicación `ESPALDA`...).

`catalogosApi.obtenerCatalogoCompleto()` descarga los 4 catálogos en paralelo
(tipos de producto, tallas, atributos, ubicaciones) y guarda **índices por id en
memoria** (`IndicesCatalogo`). `prendasApi` usa esos índices para traducir los ids de
la grilla a códigos/etiquetas.

> Géneros (`HOMBRE`, `MUJER`, `NINO`, `NINA`, `SIN_ESPECIFICAR`) y tipos de prenda
> (`VENTA`, `OBSEQUIO`, `MUESTRA`) son **listas fijas** en `catalogosApi`
> (`GENEROS_VALIDOS`, `TIPOS_PRENDA_VALIDOS`): el backend no los expone como catálogo
> y además se usan para validar datos entrantes.

## Estilos y diseño

- **Tema único**: paleta clara cálida definida en `src/app/globals.css` (CSS
  variables `--primary`, `--surface`, `--text-*`, radios, sombras). No hay temas
  alternativos (el panel de "Apariencia" se eliminó a pedido del negocio).
- **CSS Modules** por componente/página: los estilos viven junto al archivo
  (`TablaPrendas.module.css`, `pedidos.module.css`, etc.).
- **Sidebar corporativa**: siempre oscura (`--sidebar-*`), fija a la izquierda,
  colapsa a íconos bajo 900px.

## Logging

`src/utils/logger.ts` es un mini-logger sin dependencias:

- Formato `[NIVEL] [Scope] mensaje`, con colores en consola.
- `debug`/`info` solo en desarrollo; `warn`/`error` siempre.
- **Regla anti-ruido**: cada evento se loguea UNA sola vez en su frontera:
  - `apiClient` → `logger.error` (error técnico de HTTP)
  - `hooks` → `logger.warn` (problema de UI que degrada la pantalla)
  - No se loguean nunca tokens, contraseñas ni datos personales.

## Tests

`npm test` corre Vitest sobre **`src/domain`** (funciones puras):

- `calculoPrecios.test.ts` — precios base y recargos por talla/tela/cuello/acabado.
- `resumenGrupo.test.ts` — totales por tipo de prenda y "qué falta" del pedido.

El patrón buscado es: mantener la lógica de negocio en `domain` (fácil de testear) y
dejar el fetching y el estado en las capas de `services`/`hooks`.

## Convenciones del equipo

- Mensajes de commit en español, con prefijo convencional (`feat:`, `fix:`,
  `refactor:`, `docs:`...).
- Comentarios y código en español (el producto y el equipo hablan español).
- Nombres de archivos en los Services en inglés (`pedidosApi.ts`), funciones/variables
  en español o inglés según el dominio.
- No subir archivos de log (`*.log` están en `.gitignore`).