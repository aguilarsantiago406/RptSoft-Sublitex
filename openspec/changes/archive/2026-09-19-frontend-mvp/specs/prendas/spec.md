# Spec Delta

## Purpose

Es la pantalla central del MVP: la grilla de prendas, una fila por prenda, con edición en línea, herencia de la configuración del grupo vs excepciones, precio derivado de tarifas y el desglose físico de piezas (BOM). Reemplaza la pestaña `PRENDAS` de la hoja de pedido.

## ADDED Requirements

### Requirement: Una fila por prenda

El sistema SHALL mostrar una fila por cada prenda registrada (la prenda es la unidad que se cuenta), con las columnas de la pestaña `PRENDAS`: nombre en prenda, nombre de la persona, producto, talla, número, color, género, corte, cuello, tela, escudo, acabado de escudo, arquero, tipo, personalización especial, precio base, recargos, precio unitario, piezas físicas (camisetas, shorts, medias) y la columna "qué falta".

#### Scenario: El pedido PROMO 2002 se muestra completo

- **WHEN** el usuario abre el detalle del pedido PROMO 2002
- **THEN** el sistema muestra 28 filas, una por prenda, sin errores de renderizado

#### Scenario: Una persona con dos prendas ocupa dos filas

- **WHEN** un participante tiene dos prendas (por ejemplo, CLINT con un kit blanco y una camiseta azul)
- **THEN** el sistema muestra dos filas independientes, una por prenda, con su color propio

### Requirement: El número de la prenda es texto

El sistema SHALL tratar el número (dorsal) de la prenda como texto (R-K04). `S/N` es un valor válido y SHALL mostrarse distinto de un número pendiente. Números repetidos SHALL estar permitidos.

#### Scenario: Dorsal S/N

- **WHEN** una prenda tiene dorsal `S/N`
- **THEN** el sistema la muestra con el texto `S/N` como valor válido

#### Scenario: Dorsales repetidos

- **WHEN** dos prendas del mismo pedido tienen el mismo dorsal (por ejemplo, dos prendas con `7`)
- **THEN** el sistema las muestra sin error

### Requirement: Herencia versus excepción visible

El sistema SHALL distinguir visualmente el valor que una prenda hereda de la configuración general del grupo del valor excepcional de esa prenda (R-C06, R-E07). En el Sprint 1 el sistema SHALL construir esta distinción aunque los datos no traigan excepciones.

#### Scenario: Seis prendas con corte entallado

- **WHEN** el grupo tiene corte `Recto` y seis prendas de mujeres tienen corte `Entallado`
- **THEN** el sistema muestra esas seis celdas visualmente distintas de las veintidós heredadas

### Requirement: Edición en línea de la ficha mínima

El sistema SHALL permitir editar en línea los campos de la ficha mínima de la prenda: talla, número, género y nombre en prenda (R-E03). El sistema SHALL guardar el cambio con un solo envío al servidor (PATCH) y SHALL conservar el valor si el guardado falla, sin perder el borrador.

#### Scenario: Editar talla de una prenda

- **WHEN** el usuario cambia la talla de una prenda y guarda
- **THEN** el sistema envía un solo PATCH con la nueva talla y, al recargar, muestra la talla guardada

#### Scenario: El guardado falla

- **WHEN** el guardado de una prenda falla
- **THEN** el sistema avisa del fallo y conserva el cambio en pantalla sin descartarlo

### Requirement: Precio derivado de tarifas

El sistema SHALL calcular el precio unitario con la fórmula `Precio base + Recargo de talla + Recargo de tela + Recargo de cuello + Recargo de acabado`, siempre a partir de tarifas vigentes (R-K10). Un usuario de oficina SHALL NOT poder escribir un precio a mano. Las prendas de obsequio o muestra SHALL mostrar precio unitario `0` (R-K02).

#### Scenario: Kit completo talla XL

- **WHEN** una prenda es un kit completo (`Precio base` S/45) con talla `XL` (recargo S/3) y sin otros recargos
- **THEN** el precio unitario mostrado es S/48 y el desglose muestra el recargo de talla por separado

#### Scenario: Prenda de obsequio

- **WHEN** una prenda es de tipo `Obsequio` o `Muestra`
- **THEN** el sistema muestra el precio unitario en `0` y la excluye del importe total

#### Scenario: Cero precios a mano

- **WHEN** el usuario edita una prenda
- **THEN** ningún campo editable de precio aparece en la ficha

### Requirement: Desglose de piezas físicas (BOM)

El sistema SHALL calcular el desglose de piezas físicas multiplicando cada prenda por los componentes de su producto (R-K03), nunca contando filas. El desglose SHALL mostrar totales de camisetas, shorts y medias.

#### Scenario: Totales del pedido PROMO 2002

- **WHEN** el usuario consulta el resumen del pedido PROMO 2002
- **THEN** el sistema muestra exactamente 17 kits y 11 camisetas sueltas como desglose de productos, y 28 camisetas, 17 shorts y 17 medias como piezas físicas, todos calculados

### Requirement: Columna "qué falta"

El sistema SHALL marcar en la columna "qué falta" las prendas incompletas, en rojo, cuando falte género, corte, talla, número o color. El sistema SHALL permitir enviar a producción solo lo que está completo.

#### Scenario: Fila incompleta

- **WHEN** a una fila le falta el género o el corte
- **THEN** la columna "qué falta" la muestra en rojo con lo que falta

### Requirement: Estados de carga y error de la grilla

El sistema SHALL mostrar un estado de carga mientras obtiene las prendas y SHALL mostrar un estado de error claro si la obtención falla, sin mostrar datos inventados.

#### Scenario: La carga de prendas falla

- **WHEN** la obtención de prendas devuelve un error
- **THEN** el sistema muestra un mensaje de error y no datos de demostración