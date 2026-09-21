# Plan Técnico de Implementación: Módulo Pedidos (Sprint 1)

**Objetivo:** Construir el flujo completo de Pedidos en Next.js (App Router) contra la API real de NestJS/PostgreSQL, respetando las 7 decisiones estructurales de SIPES y la arquitectura definida en `ESTRUCTURA_SPRINT_1.md`.

---

## 1. Arquitectura de Navegación (Los Dos Sidebars)

En Next.js App Router, el layout privado (`(dashboard)/layout.tsx`) delega el cascarón a `components/layout/AppShell.tsx`.

### Comportamiento del Shell
- **Rutas globales (`/pedidos`, `/clientes`, etc.):** Renderiza `MainSidebar` con los módulos globales.
- **Rutas de pedido (`/pedidos/[id]/*`):** Detecta la ruta activa y **reemplaza completamente** el sidebar principal por `PedidoSidebar`.

```text
/pedidos/[id]            → [DATOS DEL PEDIDO] (Cabecera, grupos, colores, BOM físico)
/pedidos/[id]/prendas    → [PRENDAS] (Tabla de 28 prendas, excepciones visuales)
/pedidos/[id]/proforma   → [PROFORMA] (Consolidado económico y cantidades calculadas)
```

---

## 2. Vistas, Endpoints y Datos a Mostrar

### Vista 1: Lista de Pedidos (`/pedidos`)

* **Endpoint Backend:**  
  `GET /api/pedidos` (con soporte para `?estado={EstadoPedido}&clienteId={id}`)
* **Datos recibidos (`PedidoResumen[]`):**
  - `id`: string
  - `codigo`: string (ej: `SUB-1001`)
  - `cliente`: `{ id, nombre }`
  - `estado`: `BORRADOR | EN_CONFIGURACION | EN_RECOLECCION | EN_REVISION | EN_PRODUCCION | ENTREGADO | CERRADO | CANCELADO`
  - `totalPrendas`: number (calculado por la base de datos)
  - `fechaPedido`: ISO 8601
  - `fechaCompromiso`: ISO 8601 (o `null`)
* **Qué se muestra en pantalla:**
  1. **Barra de filtros (URL State):** Dropdown de selección de estado y buscador por nombre de cliente o código.
  2. **Tabla de Pedidos:** Columnas: Código, Cliente, Estado (Badge con color de estado), Total Prendas, Fecha Compromiso y Acción ("Ver detalle" → `/pedidos/[id]`).
  3. **Botón "+ Nuevo Pedido":** Abre modal o redirige a creación (`POST /api/pedidos`).
* **Configuración en Frontend:**
  - **Server Component (`page.tsx`):** Lee `searchParams` (`estado`, `q`) y ejecuta `getPedidos({ estado, clienteId })` en el servidor.
  - **Client Component (`PedidosFilters.tsx`):** Actualiza los `searchParams` en la URL con debouncing para la búsqueda y push inmediato para el estado.

---

### Vista 2: Datos del Pedido (`/pedidos/[id]`)

* **Endpoints Backend:**
  1. `GET /api/pedidos/:id`: Detalle maestro del pedido, cliente, colores y grupos con su tipo de producto y atributos.
  2. `GET /api/pedidos/:id/resumen-produccion`: Conteo consolidado BOM de piezas físicas reales y desglose por tipo de prenda (R-K02, R-K03).
* **Datos recibidos:**
  - **PedidoDetalle:**
    - `codigo`, `estado`, `fechaPedido`, `fechaCompromiso`, `observaciones`.
    - `cliente`: `{ id, nombre, telefono, ciudad }`.
    - `colores`: Array de `{ id, nombre, codigoHex, referenciaFisica }` (R-K05).
    - `grupos`: Array de `{ id, nombre, tipoProducto, cantidadContratada, politicaNumeracion, configuracion }`.
  - **ResumenProduccion:**
    - `totalPrendas`: number
    - `desgloseTiposPrenda`: `{ venta, obsequio, muestra }`
    - `piezasFisicas`: `{ totalCamisetas, totalShorts, totalMedias }` (conteo real multiplicado según componentes del producto, nunca conteo manual).
* **Qué se muestra en pantalla:**
  1. **Cabecera del Pedido:** Código, Nombre del Cliente, Estado actual con badge y acción de cambio de estado (`PATCH /api/pedidos/:id/estado`).
  2. **Panel de Resumen de Producción (BOM):** Tarjeta destacada con el cálculo de piezas físicas reales (Camisetas, Shorts, Medias) y conteo de prendas por tipo (Venta / Obsequio / Muestra).
  3. **Grupos del Pedido:** Cards por cada grupo mostrando:
     - Nombre del grupo y producto asignado.
     - Política de numeración (`LIBRE` o `UNICA` según R-G01).
     - Cantidad contratada.
     - Chips de configuración general (Tela, Cuello, Manga, etc.).
     - Acceso rápido para gestionar las prendas de ese grupo.
  4. **Colores Oficiales (R-K05):** Muestras de color con swatch visual, código `#HEX` obligatorio y referencia física/Pantone.
  5. **Datos de Entrega y Contacto:** Fechas, Ciudad de destino y Teléfono de contacto.
* **Configuración en Frontend:**
  - **Server Component asíncrono:** Ejecuta en paralelo `Promise.all([getPedido(id), getResumenProduccion(id)])`.
  - Manejo estricto de error 404 (`notFound()`) si el pedido no existe.
  - Formateo de fechas vía `lib/format/date.ts`.

---

### Vista 3: Gestión de Prendas del Pedido (`/pedidos/[id]/prendas`)

* **Endpoints Backend:**
  - `GET /api/grupos/:grupoId/participantes`: Lista de participantes con prendas, excepciones y personalizaciones.
  - `POST /api/prendas`: Registro de prenda.
  - `PATCH /api/prendas/:id`: Edición en línea de la ficha mínima (talla, número, género, nombre).
  - `POST /api/excepciones-prenda` & `DELETE /api/excepciones-prenda/:id`: Guardado como diferencia delta (R-C01/R-C05).
* **Datos recibidos por prenda:**
  - `id`, `participanteId`, `tallaId`, `numero` (string que admite "S/N"), `genero`, `tipoPrenda`, `colorId`, `nombreEnPrenda`.
  - `excepciones`: Array de `{ id, atributoId, valorAtributoId, motivo }`.
* **Qué se muestra en pantalla:**
  - La tabla principal de prendas (28 filas en el caso del pedido real `PROMO 2002`).
  - **Regla R-C06 (Diferenciación visual):** Celdas que muestran valores heredados del grupo vs celdas con excepción destacadas con distintivo visual.
  - Edición en línea de talla, número ("S/N" permitido), género y corte.

---

### Vista 4: Proforma del Pedido (`/pedidos/[id]/proforma`)

* **Endpoints Backend:**
  - `GET /api/pedidos/:id`
  - `GET /api/pedidos/:id/resumen-produccion`
* **Qué se muestra en pantalla:**
  - Vista formateada tipo documento lista para impresión o verificación comercial según la pestaña PROFORMA del Excel real.
  - Resumen de prendas por grupo, precios y recargos derivados de tarifas vigentes (R-K10). Ningún precio digitado a mano.

---

## 3. Plan de Acción Técnico Paso a Paso

1. **Fase 1: Layout Dinámico (`AppShell` + `PedidoSidebar`)**
   - Refactorizar `src/components/layout/AppShell.tsx` para detectar si `pathname` coincide con `/pedidos/[id]`.
   - Crear `src/components/layout/PedidoSidebar.tsx` con navegación a:
     - `Datos del pedido` (`/pedidos/[id]`)
     - `Prendas` (`/pedidos/[id]/prendas`)
     - `Proforma` (`/pedidos/[id]/proforma`)
     - Enlace superior "← Volver a Pedidos" para regresar a la lista global.

2. **Fase 2: Filtros en la Tabla de Pedidos (`/pedidos`)**
   - Crear componente cliente `PedidosFilters.tsx` con selector de estado y campo de búsqueda.
   - Conectar los filtros a los `searchParams` en `src/app/(dashboard)/pedidos/page.tsx`.
   - Extender `getPedidos()` en `pedidos.api.ts` para enviar los query params correspondientes a `GET /api/pedidos`.

3. **Fase 3: Enriquecer el Detalle del Pedido (`/pedidos/[id]`)**
   - Agregar tipado y llamada a `GET /api/pedidos/:id/resumen-produccion`.
   - Incorporar el panel de "Resumen de Producción (BOM)" en `src/app/(dashboard)/pedidos/[id]/page.tsx` con el conteo físico de camisetas, shorts y medias.

4. **Fase 4: Sub-ruta de Prendas (`/pedidos/[id]/prendas`)**
   - Implementar la página y la tabla de prendas con capacidad de visualización de excepciones (R-C06).
