# Tablas y alcance de BK1

## Fuentes

- Modelo relacional: `prisma/schema.prisma`
- Diagrama ER: `..\..\Pedido Management Cascade-2026-09-15-152443.svg`
- Reglas: `..\..\02___Catálogo_de_reglas.md`
- Operación: `..\..\01___Manual_SIPES.md`

## Propiedad de BK1

| Entidad | Responsabilidad |
|---|---|
| Usuario | Referencia de coordinación y auditoría |
| Cliente | Alta y consulta de clientes |
| Pedido | Cabecera, estado, fechas y relaciones principales |
| TipoProducto | Catálogo maestro y componentes BOM |
| TallaCatalogo | Catálogo de tallas por producto |
| Atributo | Catálogo de atributos de configuración |
| ValorAtributo | Valores cerrados de atributos |
| UbicacionPersonalizacion | Catálogo consumido por BK2 |
| Grupo | Agrupación comercial y política de numeración |
| ValorConfiguracion | Configuración base del grupo |
| ColorPedido | Colores oficiales del pedido |
| Tarifa | Catálogo de precios y recargos |

BK1 mantiene estas entidades en el schema y expone únicamente las operaciones
definidas en `contrato-api.md`. Las operaciones de participantes, prendas,
excepciones y personalizaciones son responsabilidad de BK2.

## Integración con BK2

BK2 utiliza `pedidoId`, `grupoId`, `tipoProductoId`, `cantidadContratada`,
`colorId`, `tallaId`, `atributoId`, `valorAtributoId` y `ubicacionId`.
BK1 no duplica las tablas ni endpoints de escritura de BK2.

## Entidades fuera del alcance operativo actual

`BloquePedido`, `VersionBloque`, `Diseno`, `RegistroCambio`, `Confirmacion`,
`DatosEnvio`, `Nesting`, `NestingParte`, `ArchivoTif` y `EventoGhl` permanecen
modeladas para las fases posteriores y no se implementan en la Fase 2.
`EventoGhl` queda además condicionado a la Fase 5 opcional.

## Regla de consistencia

El SVG y el schema deben coincidir en nombres, tipos y relaciones. Los cambios
deben hacerse primero en el schema activo y después reflejarse en el contrato y
en el OpenSpec; no se mantienen copias alternativas del modelo.
