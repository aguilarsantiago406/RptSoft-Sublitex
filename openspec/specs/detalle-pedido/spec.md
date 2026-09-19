# detalle-pedido Specification

## Purpose
Muestra la cabecera comercial del pedido: identificación, diseño aprobado, colores con su código hexadecimal, textos literales de estampado y envío a provincia. Es la vista fiel de la pestaña `PEDIDO` de la hoja de pedido.

## Requirements

### Requirement: Identificación del pedido

El sistema SHALL mostrar los datos de identificación del pedido: número, versión de la hoja, fechas, cliente/grupo, RUC o DNI, coordinador del cliente, teléfono, vendedora, modalidad de entrega y ciudad.

#### Scenario: Se muestra la identificación completa

- **WHEN** el usuario abre el detalle de un pedido
- **THEN** el sistema muestra la identificación del pedido tal como la registra la API

### Requirement: Datos del diseño aprobado

El sistema SHALL mostrar los datos del diseño aprobado: versión del mockup, fecha de aprobación, aprobador, archivo del mockup, tela principal, manga, cuellos (hombres y damas), cortes (hombres y damas), rib en cuello y mangas, acabado de escudos y tela del short.

#### Scenario: Se muestra el diseño aprobado

- **WHEN** el usuario consulta la cabecera del pedido
- **THEN** el sistema muestra los datos de diseño aprobado registrados

### Requirement: Colores con código hexadecimal

El sistema SHALL mostrar cada color del pedido con su nombre y su código hexadecimal (R-K05). El sistema SHALL marcar visualmente un color al que le falte el código.

#### Scenario: Color con su código

- **WHEN** el pedido registra el color `Blanco hueso` con código `#F7F4F2`
- **THEN** el sistema muestra el color con el código hexadecimal visible

#### Scenario: Color sin código hexadecimal

- **WHEN** un color del pedido no tiene código hexadecimal
- **THEN** el sistema lo marca como pendiente y el usuario lo detecta de inmediato

### Requirement: Ubicaciones y textos literales de estampado

El sistema SHALL mostrar cada ubicación de estampado declarada (pecho, espalda, cuello delantero, cuello posterior, mangas, short, sponsors) con su contenido literal exacto, tal como se registró. El sistema SHALL marcar las ubicaciones marcadas como "lleva" pero sin contenido.

#### Scenario: Texto literal visible y copiable

- **WHEN** el usuario consulta las ubicaciones de estampado del pedido PROMO 2002
- **THEN** el sistema muestra el texto literal (por ejemplo, `Texto "PROMO 2002", insignia del colegio bordada y sponsors correspondientes`) y permite copiarlo al portapapeles sin volver a escribirlo

#### Scenario: Ubicación sin contenido

- **WHEN** una ubicación está marcada como "Sí" pero no tiene contenido registrado
- **THEN** el sistema la marca como pendiente (por ejemplo, `SIN DEFINIR`)

### Requirement: Envío a provincia

El sistema SHALL mostrar los datos de rotulado para envío a provincia: nombre completo, DNI, celular, ciudad o destino, agencia, referencia de la agencia y correo electrónico.

#### Scenario: Se muestran los siete datos de rotulado

- **WHEN** el pedido se envía a provincia
- **THEN** el sistema muestra los siete datos de rotulado y marca los que falten
