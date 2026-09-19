# Spec Delta

## Purpose

Expone los catálogos cerrados y las tarifas vigentes del negocio (productos con sus componentes físicos, tallas, telas, cuellos, acabados y parámetros comerciales) para que la vendedora consulte sin escribir nunca un precio o un valor a mano.

## ADDED Requirements

### Requirement: Catalogos abiertos a consulta

El sistema SHALL mostrar al usuario de oficina los catálogos de productos, tallas, telas, cuellos y acabados con sus valores y recargos vigentes.

#### Scenario: Consulta de productos

- **WHEN** el usuario abre la pantalla de catálogos
- **THEN** el sistema muestra los productos con su precio base y sus componentes físicos (camisetas, shorts, medias)

#### Scenario: Recargo de talla

- **WHEN** el usuario consulta la talla `XL`
- **THEN** el sistema muestra su recargo vigente de S/3 sin que nadie lo teclee

### Requirement: Productos con componentes físicos

El sistema SHALL declarar por cada producto cuántas camisetas, shorts y medias contiene (R-K03). Un kit completo SHALL declarar 1 camiseta, 1 short y 1 par de medias; una camiseta sola SHALL declarar 1 camiseta y 0 de las demás.

#### Scenario: Componentes del kit completo

- **WHEN** el usuario consulta el producto `Kit completo`
- **THEN** el sistema muestra que contiene `1 camiseta, 1 short, 1 par de medias`

### Requirement: Parámetros comerciales

El sistema SHALL mostrar los parámetros comerciales: IGV (18%), adelanto estándar (50%), adelanto excepcional (40%), pedido mínimo (12 unidades de venta) y validez de la proforma.

#### Scenario: Pedido mínimo visible

- **WHEN** el usuario consulta los parámetros comerciales
- **THEN** el sistema muestra que el pedido mínimo es de 12 unidades de venta y que las de obsequio y muestra no cuentan

### Requirement: Listas desplegables cerradas

El sistema SHALL proveer las opciones cerradas para los campos del pedido y de las prendas: género (hombre, mujer, niño, niña, sin especificar), corte (recto, entallado, princesa), tipo de prenda (venta, obsequio, muestra), sí/no, manga y modalidad de entrega.

#### Scenario: Opciones cerradas de género

- **WHEN** el usuario elige el género de una prenda
- **THEN** el sistema ofrece únicamente las opciones del catálogo cerrado

### Requirement: Solo el administrador modifica los catálogos

El sistema SHALL permitir que solo el rol administrador modifique los catálogos. La vendedora SHALL consultar sin capacidad de edición.

#### Scenario: La vendedora no edita catálogos

- **WHEN** un usuario sin rol administrador consulta los catálogos
- **THEN** el sistema solo muestra valores, sin opciones de modificación