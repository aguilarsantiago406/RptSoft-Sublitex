# Tasks

## 1. Fundación del proyecto

- [x] 1.1 Crear la aplicación `sublitex-web` con Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4, y verificar que `npm run build` compila en verde
- [x] 1.2 Configurar Vitest como runner y ESLint, y verificar que `npm test` y `npm run lint` corren sin errores
- [x] 1.3 Crear la estructura de carpetas `src/app`, `src/components/<capacidad>`, `src/domain`, `src/services`, `src/types` y `src/mocks`, y verificar que el layout raíz renderiza
- [x] 1.4 Documentar las convenciones del proyecto en el `AGENTS.md` de la raíz (estructura de carpetas, nomenclatura de archivos y componentes, reglas de capas, comandos de verificación y prohibiciones) y verificar que opencode, Codex y Gemini CLI las exponen en su config generada (`.opencode/`, `.agents/`, `.gemini/`)

## 2. Capa de datos y contrato BK2

- [x] 2.1 Definir los tipos DTO del contrato BK2 v2.1 (participante, prenda, excepción, personalización, resumen de producción, catálogos y tarifas) en `src/types`, y verificar que compilan con `tsc`
- [x] 2.2 Implementar el simulador local que devuelve la forma exacta del contrato y persiste cambios en un JSON del workspace, y verificar el seed del pedido PROMO 2002 con 28 prendas (17 kits y 11 camisetas) cargado
- [x] 2.3 Implementar el adaptador DTO → modelo de presentación en un solo módulo, y verificar con tests que mapea `tallaId`/`numero`/`genero`/`nombreEnPrenda` y los ID de tarifas
- [x] 2.4 Implementar la validación de respuestas que rechaza DTO incompatibles, y verificar con un test que una respuesta corrupta no llega a las pantallas
- [x] 2.5 Implementar la selección explícita de origen por variable de entorno (`SIPES_BACKEND_URL` definida → backend real; ausente → simulador), y verificar que con backend configurado y caído NO se degrada a datos de demostración (spec `integracion-bk2`)

## 3. Lógica de negocio pura (sin React)

- [x] 3.1 Implementar el cálculo de precio unitario `base + recargo talla + recargo tela + recargo cuello + recargo acabado` (R-K10) con precio `0` para obsequio/muestra (R-K02), y verificar el test con kit talla XL → S/48
- [x] 3.2 Implementar el desglose de piezas físicas multiplicando componentes de cada producto (R-K03), y verificar el test del PROMO 2002: 28 camisetas, 17 shorts y 17 medias
- [x] 3.3 Implementar los totales de proforma: subtotal por producto, recargos, total sin IGV, adelanto sugerido 50% (R-K07), adelanto recibido y saldo, y verificar el test con total 1049 y adelanto 524.5
- [x] 3.4 Implementar la validación "qué falta" (género, corte, talla, número, color) y verificar que una fila sin género se marca como incompleta

## 4. Shell y navegación

- [x] 4.1 Implementar el layout de la aplicación con barra de navegación (Logo Sublitex SIMS, enlaces a Pedidos y Catálogos), y verificar que todas las rutas del MVP son navegables
- [x] 4.2 Implementar estados de carga y error compartidos del shell, y verificar que un error de datos muestra mensaje claro en lugar de datos de demo

## 5. Lista de pedidos (spec `pedidos`)

- [x] 5.1 Implementar la lista de pedidos con columnas código, cliente, producto principal, fecha y estado, y verificar que renderiza los pedidos del simulador
- [x] 5.2 Implementar búsqueda por código o cliente y filtro por estado (Borrador, En Revisión, Confirmado, En Producción), y verificar que filtran la lista observada
- [x] 5.3 Implementar la navegación desde la fila al detalle del pedido, y verificar que abre `/pedidos/:id`

## 6. Cabecera del pedido (spec `detalle-pedido`)

- [x] 6.1 Implementar la identificación del pedido (código, versión, fechas, cliente, RUC/DNI, coordinador, teléfono, vendedora, modalidad y ciudad) y verificar que se muestra desde el contrato
- [x] 6.2 Implementar el bloque de diseño aprobado (mockup, tela, manga, cuellos, cortes, rib, acabado de escudos), y verificar que se muestra completo
- [x] 6.3 Implementar el muestrario de colores con nombre y código HEX, marcando el color sin código (R-K05), y verificar el caso Blanco hueso `#F7F4F2`
- [x] 6.4 Implementar las ubicaciones de estampado con su texto literal y botón de copiar, marcando ubicaciones "Sí" sin contenido, y verificar el texto copiado sin volver a escribirlo
- [x] 6.5 Implementar el bloque de envío a provincia con los siete datos de rotulado y marcar los faltantes, y verificar el estado pendiente observable

## 7. Grilla de prendas (spec `prendas`)

- [x] 7.1 Implementar la tabla con las 26 columnas de la pestaña `PRENDAS` y una fila por prenda, y verificar que PROMO 2002 renderiza 28 filas sin errores
- [x] 7.2 Implementar el dorsal como texto con `S/N` válido y dorsales repetidos permitidos (R-K04), y verificar que `S/N` se muestra como valor legítimo
- [x] 7.3 Implementar la distinción visual heredado vs excepción resuelta por datos (R-C06/R-E07), y verificar que las 6 prendas con corte `Entallado` de PROMO 2002 se ven distintas de las 22 heredadas en `Recto`
- [x] 7.4 Implementar la edición en línea de la ficha mínima (talla, dorsal, género, nombre en prenda) con guardado en un único `PATCH` (R-E03), y verificar que falla el guardado → el borrador permanece en pantalla
- [x] 7.5 Implementar la barra de totales (BOM) con el desglose calculado y el importe, y verificar los totales exactos 28/17/17 del PROMO 2002
- [x] 7.6 Implementar la columna "qué falta" en rojo para filas incompletas, y verificar que una fila sin género o sin corte lo muestra de inmediato
- [x] 7.7 Manejar los errores del servidor en el guardado (`409` R-G03 por dorsal repetido, `R-H12` por lista cerrada) y verificar que se muestran sin perder el valor editado

## 8. Proforma (spec `proforma`)

- [x] 8.1 Implementar el desglose de cotización por producto (descripción, detalle, cantidad, precio unitario, subtotal) y verificar el caso 11 camisetas × 25 + 17 kits × 45 = 1040
- [x] 8.2 Implementar las líneas de recargos por concepto (talla, tela, cuello, acabado) y las prendas de obsequio/muestra como "sin costo" (R-K02), y verificar el recargo por tallas de 9
- [x] 8.3 Implementar el total sin IGV con nota de "no incluye IGV 18%", adelanto sugerido 50%, adelanto recibido editable y saldo pendiente (R-K07), y verificar el total 1049 con saldo 1049
- [x] 8.4 Verificar que ningún monto de la proforma es editable salvo el adelanto recibido

## 9. Catálogos (spec `catalogos`)

- [x] 9.1 Implementar la consulta de productos con precio base y componentes físicos (R-K03), tallas, telas, cuellos y acabados con sus recargos vigentes, y verificar que la talla XL muestra su recargo de 3
- [x] 9.2 Implementar la pantalla de parámetros comerciales (IGV 18%, adelanto estándar 50%, pedido mínimo 12, validez de proforma), y verificar que se muestra el pedido mínimo
- [x] 9.3 Restringir la edición de catálogos al rol administrador, y verificar que un rol de oficina solo consulta (spec `catalogos`)

## 10. Integración y cierre del MVP

- [x] 10.1 Verificar el flujo completo contra el simulador: lista → detalle → editar prenda → guardar → recargar conserva el cambio, y `npm test` en verde
- [x] 10.2 Verificar que `npm run build` y `npm run lint` pasan con el MVP completo implementado
- [x] 10.3 Preparar la prueba de aceptación contra el backend real (activar `SIPES_BACKEND_URL` + contrato BK2 v2.1) y verificar contra la API: pedido, catálogos, tarifas y PATCH con los 5 puntos del checklist de integración
- [x] 10.4 Escribir el cierre del sprint en el workspace (reglas en verde, reglas pendientes con motivo) y verificar que nombra cada regla por su identificador