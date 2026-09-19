# Spec Delta

## Purpose

Muestra el resumen financiero del pedido, equivalente a la pestaña `PROFORMA` del Excel: desglose de la cotización por producto, recargos, total sin IGV, adelanto sugerido, adelanto recibido y saldo. Todo se calcula; ningún total se escribe a mano.

## ADDED Requirements

### Requirement: Desglose de la cotización por producto

El sistema SHALL mostrar el desglose de la cotización con líneas por producto: descripción, detalle, cantidad, precio unitario y subtotal, tomando cantidad y precio de las prendas y las tarifas registradas.

#### Scenario: Camisetas y kits del PROMO 2002

- **WHEN** el pedido PROMO 2002 tiene 11 camisetas sueltas (S/25) y 17 kits (S/45)
- **THEN** el sistema muestra las líneas `Camiseta sola — 11 × 25 = 275` y `Kit completo — 17 × 45 = 765`, sumando S/1040 en subtotales

### Requirement: Recargos desglosados

El sistema SHALL mostrar los recargos por separado, agrupados por concepto: tallas especiales, tela, cuello y acabados, calculados desde las tarifas vigentes.

#### Scenario: Recargo por tallas especiales

- **WHEN** el pedido tiene 3 prendas talla `XL` con recargo de S/3 cada una
- **THEN** el sistema muestra la línea `Recargo por tallas especiales — 9`

### Requirement: Prendas de obsequio o muestra sin costo

El sistema SHALL excluir del importe a las prendas de obsequio o muestra, mostrando su cantidad como "sin costo" (R-K02).

#### Scenario: Obsequios en el detalle

- **WHEN** el pedido declara prendas de obsequio o muestra
- **THEN** el sistema las cuenta en la cantidad, las muestra como sin costo y no las suma al subtotal

### Requirement: Total sin IGV

El sistema SHALL mostrar el total sin IGV y SHALL indicar explícitamente que los precios no incluyen IGV (18%).

#### Scenario: Total calculado del PROMO 2002

- **WHEN** el pedido PROMO 2002 tiene subtotales de S/1040 más S/9 de recargos
- **THEN** el sistema muestra `TOTAL SIN IGV — 1049` y la nota de que los precios no incluyen IGV

### Requirement: Adelanto y saldo

El sistema SHALL calcular el adelanto sugerido (50% del total sin IGV, R-K07) y SHALL mostrar el adelanto recibido y el saldo pendiente como campos separados. El adelanto recibido es un dato registrado, no un cálculo.

#### Scenario: Adelanto sugerido

- **WHEN** el total sin IGV es S/1049
- **THEN** el sistema muestra el adelanto sugerido de S/524.5

#### Scenario: Saldo pendiente

- **WHEN** el adelanto recibido es `0`
- **THEN** el sistema muestra el saldo pendiente igual al total sin IGV

### Requirement: Ningún valor financiero se escribe a mano

El sistema SHALL NOT permitir que el usuario de oficina ingrese subtotales, totales, adelanto sugerido o saldo: todos SHALL derivarse de prendas y tarifas.

#### Scenario: Solo el adelanto recibido es editable

- **WHEN** el usuario revisa la proforma
- **THEN** únicamente el campo "adelanto recibido" es editable; el resto de los montos se muestran calculados y bloqueados