# Spec Delta

## Purpose

Permite al usuario de oficina encontrar un pedido por su código o cliente, conocer su estado y abrir el detalle correcto. Es la puerta de entrada al flujo de ventas.

## ADDED Requirements

### Requirement: Listar pedidos

El sistema SHALL mostrar una lista de pedidos con, al menos, las columnas: código del pedido, cliente/grupo, tipo de prenda principal, fecha y estado. La lista SHALL venir de los datos del sistema (API o simulador), nunca de texto escrito a mano.

#### Scenario: La lista muestra los pedidos existentes

- **WHEN** el usuario abre la pantalla de pedidos
- **THEN** el sistema muestra todos los pedidos disponibles con su código, cliente, estado y fecha

### Requirement: Buscar y filtrar pedidos

El sistema SHALL permitir buscar un pedido por texto libre que coincida con código o cliente, y SHALL permitir filtrar por estado.

#### Scenario: Buscar por código

- **WHEN** el usuario escribe el código `SUB-000001` en la búsqueda
- **THEN** el sistema muestra solo el pedido cuyo código coincide

#### Scenario: Filtrar por estado

- **WHEN** el usuario filtra por estado `En Producción`
- **THEN** el sistema muestra solo los pedidos en ese estado

### Requirement: Estados de pedido

El sistema SHALL representar el estado de cada pedido con uno de estos valores: `Borrador`, `En Revisión`, `Confirmado` o `En Producción`.

#### Scenario: Todo pedido posee un estado

- **WHEN** la lista es cargada
- **THEN** cada fila muestra uno de los cuatro estados definidos

### Requirement: Navegar al detalle del pedido

El sistema SHALL permitir abrir el detalle de un pedido desde su fila en la lista.

#### Scenario: Abrir detalle desde la lista

- **WHEN** el usuario hace clic en un pedido de la lista
- **THEN** el sistema navega al detalle de ese pedido

### Requirement: Estados de carga y error de la lista

El sistema SHALL mostrar un estado de carga mientras obtiene los pedidos y SHALL mostrar un mensaje de error claro si la obtención falla, sin mostrar datos vacíos o inventados.

#### Scenario: La carga falla

- **WHEN** la obtención de pedidos devuelve un error
- **THEN** el sistema muestra un mensaje de error y no muestra una lista vacía ni datos de demostración