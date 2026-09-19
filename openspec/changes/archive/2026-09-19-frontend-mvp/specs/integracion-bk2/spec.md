# Spec Delta

## Purpose

Conecta las pantallas con los datos: adapta el contrato de API de Backend 2 v2.1 al modelo de presentación, usa un simulador local con la misma forma mientras el backend no existe, y valida las respuestas antes de mostrarlas.

## ADDED Requirements

### Requirement: Contrato de API de Backend 2 v2.1

El sistema SHALL consumir los endpoints del contrato BK2 v2.1 respetando sus contratos: detalle del pedido, catálogos, tarifas, participantes con prendas anidadas, guardado de prenda (`PATCH /api/prendas/:id`) y resumen de producción.

#### Scenario: El detalle se carga desde el contrato

- **WHEN** el usuario abre el detalle de un pedido
- **THEN** el sistema obtiene el pedido, los catálogos, las tarifas y los participantes con sus prendas a través de los endpoints del contrato

### Requirement: Guardado único de la prenda

El sistema SHALL persistir la ficha mínima de la prenda con un solo `PATCH` que envíe talla, número, género y nombre en prenda (R-E03). El sistema SHALL representar un dorsal repetido con política de unicidad como error del servidor (`409`) y una lista cerrada como `R-H12`, sin ignorarlos.

#### Scenario: Guardar una prenda

- **WHEN** el usuario edita talla, dorsal, género y nombre en prenda y presiona guardar
- **THEN** el sistema envía un único `PATCH` con esos cuatro campos y refleja el resultado en pantalla

#### Scenario: Dorsal repetido con política UNICA

- **WHEN** el servidor responde `409` con `R-G03` ante un dorsal repetido
- **THEN** el sistema muestra el error al usuario y conserva el valor editado

### Requirement: Simulador local mientras no exista backend

El sistema SHALL ofrecer un simulador local que devuelva respuestas con la forma exacta del contrato y persista los cambios localmente, para que las pantallas se desarrollen sin esperar al backend. El uso del simulador SHALL ser explícito y configurable, no un silencio de datos.

#### Scenario: Desarrollar con simulador

- **WHEN** no hay backend configurado
- **THEN** el sistema responde con el simulador local con la misma forma del contrato y conserva los cambios de prendas tras una recarga

### Requirement: Falla del backend no cae a la demo

El sistema SHALL NOT degradar en silencio a datos de demostración cuando el backend real está configurado y falla.

#### Scenario: El backend real falla

- **WHEN** `SIPES_BACKEND_URL` está configurada y devuelve un error
- **THEN** el sistema muestra el error real y no reemplaza la respuesta por datos de demostración

### Requirement: Validación de respuestas

El sistema SHALL validar que las respuestas de la API cumplan su contrato antes de mostrarlas y SHALL rechazar datos incompatibles.

#### Scenario: Respuesta incompatible

- **WHEN** la respuesta de la API no coincide con el contrato esperado
- **THEN** el sistema la rechaza y muestra un error de compatibilidad en lugar de datos corruptos