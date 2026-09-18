# OpenSpec — SIPES Backend BK1

## Objetivo

Proporcionar una API NestJS con persistencia PostgreSQL/Prisma para registrar
clientes, pedidos, colores y grupos, manteniendo las reglas críticas en la
aplicación y en `prisma/01_constraints.sql`.

## Requisitos funcionales

### Clientes

- Crear, listar y consultar clientes.
- Generar identificadores internos CUID.
- Mantener el estado activo y las fechas de auditoría.

### Pedidos

- Crear pedidos con código `SUB-XXXX` generado por el servidor.
- Iniciar siempre en `BORRADOR`.
- Exigir `fechaCompromiso` posterior a `fechaPedido`.
- Permitir únicamente las transiciones declaradas por R-A06.
- Exponer detalle con cliente, colores y grupos.

### Colores

- Asociar colores al pedido.
- Validar `codigoHex` con `#RRGGBB`.
- Aceptar un color individual o un arreglo no vacío en la misma operación.
- Rechazar duplicados por pedido y nombre.

### Grupos

- Crear y listar grupos bajo un pedido.
- Exigir `tipoProductoId` y `cantidadContratada`.
- Mantener `LIBRE` o `UNICA` como únicas políticas de numeración.
- Permitir consultar, actualizar, cambiar política y eliminar grupos sin
  participantes ni prendas.
- Exponer la configuración base y los componentes BOM.

### Catálogos

- Exponer tipos de producto y sus componentes físicos.
- Exponer tallas, atributos, valores y ubicaciones activas.
- Mantener los catálogos mediante seed idempotente.

### Producción

- Calcular prendas registradas frente a `cantidadContratada`.
- Calcular faltantes y sobrantes.
- Multiplicar componentes BOM por las prendas registradas.
- Incluir prendas `OBSEQUIO` y `MUESTRA` en producción sin cobrarlas.
- Mantener los importes fuera del resumen operativo; pertenecen a la
  confirmación comercial y al catálogo de tarifas.

## Contrato de integración BK2

BK1 debe entregar identificadores y datos estables para:

| Dato | Uso de BK2 |
|---|---|
| `pedidoId` | Asociar participantes y prendas al pedido |
| `grupoId` | Crear participantes dentro del grupo |
| `tipoProductoId` | Resolver producto y BOM |
| `cantidadContratada` | Comparar avance de recolección |
| `colorId` | Asociar colores oficiales a prendas |
| `tallaId` | Seleccionar tallas válidas por producto |
| `atributoId` / `valorAtributoId` | Registrar excepciones |
| `ubicacionId` | Registrar personalizaciones |

BK1 no implementa endpoints de participantes, prendas, excepciones ni
personalizaciones.

## Reglas no negociables

- `EstadoPedido` contiene ocho estados oficiales.
- `PoliticaNumeracion` contiene únicamente `LIBRE` y `UNICA`.
- Los códigos HEX cumplen `^#([0-9A-Fa-f]{6})$`.
- Los totales de producción se calculan desde BOM, nunca desde valores enviados.
- Las restricciones SQL son parte obligatoria de la instalación.
- GoHighLevel permanece fuera del alcance actual.

## Validación

- `npm run build`
- `npm test -- --runInBand`
- Verificación de ocho triggers con la consulta indicada en
  `SIPES-repo/LEEME.txt`.
