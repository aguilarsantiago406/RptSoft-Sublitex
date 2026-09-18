# Contexto Técnico del Frontend — `sublitex-web`

Este documento describe la arquitectura técnica, estructura de carpetas, flujo de datos y estado actual del código en `sublitex-web`.

---

## 1. Stack Tecnológico

- **Framework**: Next.js 16.3.4 (App Router)
- **Librería UI**: React 19.2.8
- **Lenguaje**: TypeScript 5 (estricto)
- **Estilos**: Vanilla CSS Modules (`*.module.css`)
- **Testing**: Vitest 3.2.7 con path alias `@/*` -> `./src/*`

---

## 2. Arquitectura de Carpetas (`src/`)

```
src/
├── domain/                  # 1. LÓGICA PURA (Agnóstica de UI y framework)
│   ├── calculoPrecios.ts    # Precios base, recargos y resolución de excepciones
│   ├── calculoPiezas.ts     # Desglose de piezas físicas (BOM: camisetas, shorts, medias)
│   ├── calculoTotales.ts    # Consolidado de importes y conteo de piezas para el pedido
│   ├── validacionPrenda.ts  # Validación data-driven de campos requeridos (R-B06)
│   └── calculoPrecios.test.ts # 12 tests unitarios en Vitest (100% pasando)
│
├── components/prendas/      # 2. COMPONENTES DE PRESENTACIÓN (Grilla de prendas)
│   ├── TablaPrendas.tsx     # Orquestador (<table>, <thead> con 25 columnas, <tbody>)
│   ├── FilaPrenda.tsx       # Fila tabular (<tr> con 25 celdas, inputs y selects)
│   ├── CeldaEditable.tsx    # Celda para Corte/Cuello/Tela/Acabado (marca excepciones en amarillo)
│   ├── TotalesPrendas.tsx   # Pie de tabla (<tfoot> con 10 métricas calculadas)
│   └── TablaPrendas.module.css # Clases CSS centralizadas sin estilos inline
│
├── hooks/                   # 3. GESTIÓN DE ESTADO Y DATA FETCHING
│   ├── usePedidoDetalle.ts  # Fetch del pedido (/api/pedidos/[id]). Toma grupos[0]
│   └── useGrupoPrendas.ts   # Estado de prendas, mutaciones optimistas y totales memoizados
│
├── services/                # 4. MOCKS DEL CONTRATO DE API REST (§5.1)
│   ├── catalogoMock.ts      # Catálogo de productos, tallas, atributos y géneros
│   ├── tarifasMock.ts       # Tarifas vigentes para precio base y recargos
│   ├── grupoPrendasMock.ts  # Prendas del grupo con valores base y excepciones
│   ├── pedidoDetalleMock.ts # Cabecera del pedido, cliente, colores y grupos
│   └── pedidosListaMock.ts  # Lista de pedidos para la vista principal
│
├── app/                     # 5. RUTAS Y PÁGINAS (Next.js App Router)
│   ├── pedidos/page.tsx     # Lista general de pedidos
│   ├── pedidos/[id]/page.tsx# Vista de detalle: orquesta hooks y TablaPrendas
│   ├── api/                 # Endpoints mock con validación y manejo de errores 404
│   ├── layout.tsx           # Shell raíz de la app
│   └── globals.css          # Estilos globales mínimos
│
└── types/                   # 6. DEFINICIONES DE TIPOS (TypeScript)
    ├── prendas.ts           # PrendaItem, CatalogoCompleto, Tarifa, TotalesPedido, etc.
    └── pedidos.ts           # PedidoDetalle, GrupoConfiguracion, ColorPedido, etc.
```

---

## 3. Flujo de Datos y Componentes

```
[ app/pedidos/[id]/page.tsx ]
         │
         ├── usePedidoDetalle(id)  ──>  GET /api/pedidos/[id] (datos cabecera + grupos)
         │
         └── useGrupoPrendas(grupoId, config)
                   │
                   │ (estado local de prendas + mutaciones + totales con useMemo)
                   ▼
         <TablaPrendas> (Orquestador: <thead> + tabla contenedor)
              │
              ├── <FilaPrenda> (x cada prenda: inputs, selects, badges, precios)
              │        │
              │        └── <CeldaEditable> (Corte, Cuello, Tela, Acabado con excepción)
              │
              └── <TotalesPrendas> (<tfoot>: importes y piezas consolidadas)
```

### Cómo se edita una prenda:
1. El usuario cambia un input/select en `<FilaPrenda />` o `<CeldaEditable />`.
2. Se dispara `onActualizarPrenda(idPrenda, update)`.
3. `useGrupoPrendas` aplica la mutación inmutable en el array de `prendas`.
4. El hook recalcula automáticamente los `totales` mediante `useMemo` llamando a `calcularTotales(prendas, tarifas, catalogo)`.

---

## 4. Estado Actual del Frontend

### Lo que está implementado y funcionando:
- **Capa de Dominio Completa**: `calcularPrecio`, `calcularPiezas`, `calcularTotales` y `validarPrenda` testeados con 12 pruebas unitarias.
- **Grilla Modular (Split 4 unidades)**:
  - `TablaPrendas.tsx` (77 líneas): Limpio, solo orquesta.
  - `FilaPrenda.tsx` (250 líneas): 25 columnas conectadas a eventos de actualización.
  - `CeldaEditable.tsx` (64 líneas): Detecta excepciones (`origen === 'EXCEPCION'`) y pinta `#fff3cd`.
  - `TotalesPrendas.tsx` (34 líneas): Desglose de importes y piezas físicas en `<tfoot>`.
  - `TablaPrendas.module.css`: CSS modular sin duplicación de estilos inline.
- **Mocks API funcionales**: `/api/pedidos`, `/api/pedidos/[id]`, `/api/tarifas`, `/api/catalogos`, `/api/grupos/[id]/prendas` con soporte de 404 (`noEncontrado`).
- **Verificación**: `tsc --noEmit` = 0 errores, `vitest` = 12/12 tests verdes.

### Lo que falta implementar en el Frontend:
- **Selector de Múltiples Grupos**: `src/app/pedidos/[id]/page.tsx` actualmente solo toma `grupos[0]`. Si un pedido tiene más de un grupo de configuración, no hay tabs/selector para alternar.
- **Metadata en Layout**: `src/app/layout.tsx` todavía conserva el título por defecto "Create Next App".
- **Conexión a Backend Real**: Cambiar las llamadas fetch de los endpoints mock (`/api/*`) a la API real de NestJS una vez que esté desplegada.

---

## 5. Comandos Clave del Frontend

```bash
# Correr tests unitarios de dominio
npm test

# Verificación de compilación y tipos TypeScript
npx tsc --noEmit

# Levantar entorno de desarrollo local (localhost:3000)
npm run dev
```
