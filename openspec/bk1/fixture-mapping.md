# Mapeo del fixture PROMO 2002

| Fixture CSV | BK1 |
|---|---|
| `Kit completo` | `TipoProducto.codigo = KIT` |
| `Camiseta sola` | `TipoProducto.codigo = CAMISETA` |
| `Blanco hueso` | `ColorPedido.nombre = Blanco hueso` |
| `Azul` | `ColorPedido.nombre = Azul` |
| `Win Fresh` | `ValorAtributo.codigo = WIN` |
| `Hombre`, `Mujer`, `Niño` | `HOMBRE`, `MUJER`, `NINO` |
| `Sí` / `No` | Valor del atributo `ESCUDO` |

El fixture contiene 28 filas: 17 de `Kit completo` y 11 de `Camiseta sola`.
La unidad contable de BK1 sigue siendo `Prenda`; las piezas físicas se
calculan mediante el BOM de `TipoProducto`.

`corte`, `cuello`, `tela`, `escudo`, `acabado` y `personalizacion` son datos
que BK2 y las fases de diseño/producción deben persistir como configuración,
excepción o personalización. BK1 expone los catálogos y relaciones necesarios,
pero no implementa esas operaciones.
