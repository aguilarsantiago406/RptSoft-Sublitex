# Proposal

## Why

Hoy un pedido de Sublitex vive en WhatsApp y en una hoja de Excel: la vendedora teclea datos, el diseñador los vuelve a escribir, producción trabaja con otra lista y la confirmación al cliente se arma a mano. Cada copia manual es una oportunidad de error que llega hasta la tela impresa. El MVP del frontend existe para que **un dato del pedido se escriba una sola vez** y ventas, diseño y producción lean el mismo dato calculado desde la misma fuente.

Se construye ahora porque el Sprint 1 del roadmap lo exige como entregable verificable: el pedido real PROMO 2002 debe cargarse, verse y editarse en una aplicación de oficina antes de que exista cualquier cierre comercial.

## What Changes

- Crear desde cero la aplicación web de oficina/coordinador de SIPES (Next.js 16 + React 19 + TypeScript) en un workspace nuevo e independiente.
- **Lista de pedidos** (`/pedidos`): tabla con búsqueda por cliente o código, filtros por estado y apertura del detalle.
- **Detalle del pedido** (`/pedidos/:id`): cabecera comercial equivalente a la pestaña `PEDIDO` del Excel — identificación, diseño aprobado, colores con código HEX (R-K05), ubicaciones y textos literales de estampado, datos de envío a provincia y control de cambios.
- **Grilla de prendas**: tabla de una fila por prenda (las 26 columnas de la pestaña `PRENDAS`: producto, talla, número como texto, color, género, corte, cuello, tela, precio base y recargos, piezas físicas y "qué falta"). Edición en línea, valores heredados del grupo visualmente distintos de las excepciones, y `PRECIO UNIT.` derivado de tarifas (R-K10), nunca escrito a mano.
- **Proforma** (equivalente a la pestaña `PROFORMA`): desglose de cotización por producto, recargos, total sin IGV, adelanto sugerido del 50% (R-K07), adelanto recibido y saldo pendiente.
- **Catálogos** (`/catalogos`): productos con sus componentes físicos (R-K03), tallas con recargos, telas, cuellos, acabados y parámetros comerciales (IGV 18%, adelanto, pedido mínimo de 12 unidades).
- **Capa de datos del contrato BK2 v2.1**: la aplicación consume la forma exacta definida en `contrato-api.md` (participantes, prendas, excepciones, personalizaciones y resumen de producción), con un simulador local mientras no exista el backend real.
- Vaciado del alcance de Sprint 1: reglas de los bloques A, B, D, E y K aplicables a la pantalla de oficina. Los resúmenes (BOM) se calculan multiplicando componentes por prendas (R-K03), no contando filas.

## Capabilities

### New Capabilities

- `pedidos`: listar pedidos, buscarlos por cliente o código, filtrarlos por estado y navegar al detalle.
- `detalle-pedido`: la cabecera comercial del pedido — identificación, diseño aprobado, colores con código HEX, ubicaciones y textos literales, envío a provincia y control de cambios.
- `prendas`: la grilla de 26 columnas con edición en línea, herencia vs excepción, precio derivado de tarifas y la columna "qué falta".
- `proforma`: el resumen financiero — desglose por producto, recargos, total, adelanto sugerido/recibido y saldo.
- `catalogos`: consulta de catálogos cerrados y tarifas vigentes (solo administrador los modifica).
- `integracion-bk2`: adaptación del contrato de API de Backend 2 v2.1, simulador local mientras no exista backend y validación de respuestas.

### Modified Capabilities

- Ninguna: todas las capacidades son nuevas en este workspace greenfield.

## Impact

- **Código**: la aplicación `sublitex-web` se construye desde cero dentro del workspace `sublitex-mvp`; no modifica ningún repositorio existente.
- **APIs**: consume el contrato BK2 v2.1 (`contrato-api.md`) — participantes, prendas, excepciones, personalizaciones y resumen de producción; expone un puente local (simulador) con la misma forma hasta la integración.
- **Dependencias**: Next.js 16, React 19, TypeScript, Tailwind CSS y Vitest.
- **Datos**: seed real del pedido PROMO 2002 — 28 filas de prendas, 17 kits, 11 camisetas sueltas y 62 piezas físicas (28 camisetas, 17 shorts, 17 medias), con los colores `#F7F4F2` (Blanco hueso) y `#2B4E7A` (Azul).
- **Exclusiones del MVP**: el flujo público del participante por enlace WhatsApp (Sprint 4), la edición de excepciones contra la API (Sprint 2), el cierre/confirmación (Sprint 3) y el nesting (posterior al Sprint 4).