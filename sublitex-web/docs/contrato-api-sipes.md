# Contrato de API · SIPES

Versión 1.1 · Contrato del backend, entregable del día 3 del Sprint 1. 12 de septiembre de 2026.

Este documento **define la API que implementa el backend** (Bloques A, B, D, E + K02/K03/K04 del Sprint 1) y que consumen los tres frentes de frontend contra su simulador. Es quien describe **qué recibe y qué devuelve cada endpoint**, con un ejemplo real de respuesta por cada uno (`SIPES - Ruta del proyecto y Sprint 1.md:171`).

Autores: Backend 1 (guardián) y Backend 2. Consumidores: Frontend 1, Frontend 2/3. Todo habla en el idioma del modelo real (`schema_1.prisma` v0.2 + `01_constraints_1.sql`). **Nada se inventa aquí que no exista en el schema.**

---

## 1. Reglas generales

### 1.1 Base y formato

- Base de la API: `/api`.
- Formato: `JSON` (`Content-Type: application/json`).
- Respuestas exitosas: el recurso directamente (array u objeto).
- **Errores: siempre** con la misma forma — `codigo` es el identificador de la regla (R-…), que es exactamente lo que los triggers de `01_constraints_1.sql` lanzan. El consumidor NO parsea mensajes: mapea códigos.

```json
{
  "error": {
    "codigo": "R-C05",
    "mensaje": "La excepcion no puede ser igual al valor general del grupo",
    "detalle": "prenda pr_abc, atributo CORTE"
  }
}
```

### 1.2 Identidad: `id` vs `codigo`

| Campo | Característica | Uso |
| --- | --- | --- |
| `id` | cuid generado por la BD | **Ruta canónica** de todos los recursos |
| `codigo` | legible y único (ej. `SUB-000842`, `CAMISETA_SHORT`, `TELA`) | Display, WhatsApp, referencia en catálogos |

- Todas las rutas operan por `id`. El `codigo` es de display y de referencia en catálogos.
- Las tallas **no** tienen código global: viven dentro de su producto (R-E04).

### 1.3 Autenticación y roles

- Endpoints de oficina: `Authorization: Bearer <jwt>` con rol de `RolUsuario`.
- No autenticado: `401`. Rol sin permiso: `403`.
- El enlace público de participante usa su propio token (BK2), sin cuenta. Expirado: `410`.

### 1.4 Código de respuesta HTTP por regla

| Regla | Qué viola | HTTP |
| --- | --- | --- |
| R-C05 | Excepción idéntica al valor general del grupo | `422` |
| R-G03 | Número duplicado dentro del grupo con `politicaNumeracion=UNICA` | `409` |
| R-G06 | Cambiar la política a UNICA existiendo duplicados | `409` |
| R-H12 | Modificar datos bajo bloque `CERRADO` | `409` |
| R-I02 / R-H14 | Intentar editar/borrar un registro append-only | `403` |
| R-K05 | Aprobar diseño con color sin `codigoHex` | `422` |
| R-K07 | `adelantoRecibido > total` o saldo que no cuadra | `422` |
| R-K10 | Crear una segunda tarifa vigente para el mismo `{tipo, concepto}` | `409` |
| R-A09 | `fechaCompromiso` anterior a `fechaPedido` | `422` |
| — | Recurso inexistente o enlace revocado | `404` / `403` |

---

## 2. Catálogos y tarifas

### 2.1 `GET /api/catalogos`

- **Método:** `GET`
- **Ruta:** `/api/catalogos`
- **Request:** sin parámetros.
- **Autenticación:** token de oficina.

**Response 200** — catálogo completo y cerrado (tablas de referencia, sin paginación):

```json
{
  "productos": [
    {
      "codigo": "CAMISETA_SHORT",
      "nombre": "Camiseta + short",
      "orden": 1,
      "componentes": { "camisetas": 1, "shorts": 1, "medias": 0 }
    }
  ],
  "tallasPorProducto": [
    {
      "productoCodigo": "CAMISETA_SHORT",
      "tallas": [
        { "codigo": "S", "etiqueta": "S (adulto)", "orden": 1 },
        { "codigo": "XL", "etiqueta": "XL", "orden": 4 }
      ]
    }
  ],
  "atributos": [
    {
      "codigo": "CUELLO",
      "nombre": "Cuello",
      "obligatorio": true,
      "criticoProduccion": true,
      "valores": [
        { "codigo": "REDONDO", "etiqueta": "Redondo", "orden": 1 },
        { "codigo": "CAMISERO", "etiqueta": "Camisero", "orden": 5 }
      ]
    }
  ],
  "ubicaciones": [
    { "codigo": "PECHO", "etiqueta": "Pecho", "orden": 1 },
    { "codigo": "CUELLO_DELANTERO", "etiqueta": "Cuello delantero", "orden": 3 }
  ],
  "generos": ["HOMBRE", "MUJER", "NINO", "NINA", "SIN_ESPECIFICAR"],
  "tiposPrenda": ["VENTA", "OBSEQUIO", "MUESTRA"]
}
```

**Errores:** `401`.

**Referencia al schema:** `TipoProducto.codigo` = `CAMISETA`, `CAMISETA_SHORT`, `KIT`, `ARQUERO`, `SHORT`, `MEDIAS`, `FALDA` (`schema:336`) con `camisetas/shorts/medias` (R-K03). `Atributo.codigo` = `TELA, COLOR, CUELLO, MANGA, CORTE, ESCUDO, SHORT, MEDIAS` (`schema:384`). `UbicacionPersonalizacion.codigo` = `PECHO, ESPALDA, CUELLO_DELANTERO, CUELLO_POSTERIOR, MANGA_IZQUIERDA, MANGA_DERECHA, SHORT_DELANTERO, SHORT_POSTERIOR` (`schema:426`).

### 2.2 `GET /api/tarifas`

- **Método:** `GET`
- **Ruta:** `/api/tarifas`
- **Request:** opcional `?tipo=RECARGO_TALLA` para traer solo un tipo.
- **Autenticación:** token de oficina.

**Response 200** — tarifas **vigentes** (R-K10: a lo sumo una por `{tipo, concepto}`; el índice `tarifa_una_vigente_por_concepto` de `01_constraints.sql:342` lo garantiza):

```json
[
  { "tipo": "PRODUCTO",       "concepto": "CAMISETA",        "valor": 25.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "CAMISETA_SHORT",  "valor": 40.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "KIT",             "valor": 45.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "ARQUERO",         "valor": 35.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "CONJUNTO_ARQUERO","valor": 60.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "SHORT",           "valor": 15.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "MEDIAS",          "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "FALDA",           "valor": 25.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "PRODUCTO",       "concepto": "BANDEROLA",       "valor": 25.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "6",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "8",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "10",              "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "12",              "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "14",              "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "16",              "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "S",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "M",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "L",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "XL",              "valor": 3.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "XXL",             "valor": 6.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TALLA",  "concepto": "XXXL",            "valor": 10.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "DRY_FIT",         "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "WIN_FRESH",       "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "MARATHON",        "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "PUMA",            "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "PALMEIRA",        "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "HEXAGONAL",       "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "LABRADA",         "valor": 10.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_TELA",   "concepto": "NOVA_SIN_FORRO",  "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_CUELLO", "concepto": "REDONDO",         "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_CUELLO", "concepto": "REDONDO_CRUZADO", "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_CUELLO", "concepto": "V",               "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_CUELLO", "concepto": "V_CRUZADO",       "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_CUELLO", "concepto": "CAMISERO",        "valor": 10.00, "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "NINGUNO",        "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "SUBLIMADO",      "valor": 0.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "TERMOSELLADO",   "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "BORDADO",        "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "DTF",            "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "VINIL",          "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null },
  { "tipo": "RECARGO_ACABADO", "concepto": "PARCHE",         "valor": 5.00,  "vigenteDesde": "2026-01-01", "nota": null }
]
```

**Errores:** `401`.

**Campos de cada fila:** `id` (cuid), `tipo` (`TipoTarifa`), `concepto`, `valor` (`Decimal(10,2)`), `vigenteDesde`, `vigenteHasta` (null si rige), `activo`, `nota`. (`schema:779-793`.)

**Aclaración de vocabulario (REGLA pendiente de guardián):** el comentario del schema (`schema:782`) ejemplifica `concepto` con etiquetas ("Kit completo", "Puma"…), pero el contrato usaría **códigos** (`KIT`, `PUMA`…) para que todo `concepto` de tarifa sea el mismo `codigo` del catálogo de §2.1. Para los recargos no hay diferencia (código = etiqueta); la diferencia existe solo en `PRODUCTO` (`KIT` vs "Kit completo"). **Este contrato asume códigos mientras el guardián no resuelva la REGLA.** Reportar como `REGLA-TARIFA-001`.

**REGLA-RECARGO-001 (pendiente de guardián):** todo concepto parametrizable figura en `/api/tarifas` con su fila explícita — el valor real si paga recargo, o `0.00` si el recargo está incluido en el precio base. Cambiar un recargo = actualizar el `valor` de la fila existente; nunca agregar conceptos como atajo. Una prenda sin fila de tarifa para su configuración implica recargo `0.00` por defecto (comportamiento del front, §5). El universo de filas proviene de la hoja `CATALOGOS` del libro `Hoja_Pedido_Sublitex.xlsx`.

---

## 3. Pedidos

### 3.1 `GET /api/pedidos`

- **Método:** `GET`
- **Ruta:** `/api/pedidos`
- **Request:** opcionales `?estado=&clienteId=`.
- **Autenticación:** token de oficina.

**Response 200** — lista liviana (Frontend 1):

```json
[
  {
    "id": "ped_abc",
    "codigo": "SUB-000842",
    "estado": "EN_RECOLECCION",
    "cliente": { "id": "cli_1", "nombre": "Colegio San Agustín — Promo 2002" },
    "totalPrendas": 10,
    "fechaPedido": "2026-09-01T10:00:00Z",
    "fechaCompromiso": "2026-09-20T18:00:00Z"
  }
]
```

Notas: `totalPrendas` es el conteo real de prendas; `fechaCompromiso` puede ser `null`.

**Errores:** `401`.

### 3.2 `POST /api/pedidos`

- **Método:** `POST`
- **Ruta:** `/api/pedidos`
- **Autenticación:** token de oficina (rol VENDEDORA o COORDINADOR_OPERATIVO).

**Request body:**

```json
{
  "clienteId": "cli_1",
  "codigo": "SUB-000847",
  "fechaCompromiso": "2026-10-01T18:00:00Z",
  "grupos": [
    {
      "nombre": "Conjuntos blancos",
      "tipoProductoCodigo": "KIT",
      "cantidadContratada": 10,
      "politicaNumeracion": "LIBRE",
      "configuracion": [
        { "atributo": "CUELLO", "valor": "REDONDO" },
        { "atributo": "TELA", "valor": "DRY_FIT" }
      ]
    }
  ]
}
```

**Response 201** — el `GET /api/pedidos/:id` del pedido creado (§3.3).

**Errores:** `400` (DTO inválido), `401`, `403`, `409` R-A03 (`codigo` duplicado), `422` R-A09 (fecha), `409` R-K10 si la tarifa del producto no existe.

### 3.3 `GET /api/pedidos/:id`

- **Método:** `GET`
- **Ruta:** `/api/pedidos/:id`
- **Autenticación:** token de oficina.

**Response 200** — detalle consolidado que desbloquea la tabla de prendas:

```json
{
  "id": "ped_abc",
  "codigo": "SUB-000842",
  "estado": "EN_RECOLECCION",
  "cliente": { "id": "cli_1", "nombre": "Colegio San Agustín — Promo 2002", "telefono": "+51 987 654 321", "ciudad": "Lima" },
  "fechaPedido": "2026-09-01T10:00:00Z",
  "fechaCompromiso": "2026-09-20T18:00:00Z",
  "observaciones": "Entregar con estampado de escudo termosellado y nombres en mayúsculas.",
  "colores": [
    { "id": "col_1", "nombre": "Blanco hueso", "codigoHex": "#F7F4F2", "referenciaFisica": null }
  ],
  "grupos": [
    {
      "id": "grp_1",
      "nombre": "Conjuntos blancos",
      "tipoProducto": { "codigo": "KIT", "nombre": "Kit completo", "componentes": { "camisetas": 1, "shorts": 1, "medias": 1 } },
      "cantidadContratada": 10,
      "politicaNumeracion": "LIBRE",
      "configuracion": [
        { "atributo": "CUELLO", "valor": "REDONDO" },
        { "atributo": "TELA", "valor": "DRY_FIT" },
        { "atributo": "CORTE", "valor": "RECTO" },
        { "atributo": "ESCUDO", "valor": "NINGUNO" }
      ]
    }
  ]
}
```

Notas: la `configuracion` del grupo es una **lista** de `{atributo, valor}` (el schema guarda `ValorConfiguracion` como fila por atributo); `colores[]` vive a nivel de pedido (R-K05) y las prendas referencian `colorId`.

**Errores:** `401`, `404`.

### 3.4 `PATCH /api/pedidos/:id/estado`

- **Método:** `PATCH`
- **Ruta:** `/api/pedidos/:id/estado`
- **Autenticación:** token de oficina.

**Request body:**

```json
{ "estado": "EN_REVISION" }
```

**Response 200:**

```json
{
  "id": "ped_abc",
  "codigo": "SUB-000842",
  "estadoAnterior": "EN_RECOLECCION",
  "estadoNuevo": "EN_REVISION",
  "actualizadoEn": "2026-09-12T10:00:00Z"
}
```

Transiciones permitidas (estado global del pedido, R-A05):

`BORRADOR → EN_CONFIGURACION → EN_RECOLECCION → EN_REVISION → CERRADO → EN_PRODUCCION → ENTREGADO`

`CANCELADO` solo desde `BORRADOR`, `EN_CONFIGURACION` o `EN_RECOLECCION`.

**Errores:** `401`, `404`, `409` ES-001 (transición inválida o retorno a estado anterior; regla local del contrato mientras el catálogo no nombre la regla).

---

## 4. Grupos

### 4.1 `POST /api/pedidos/:id/grupos`

- **Método:** `POST`
- **Ruta:** `/api/pedidos/:id/grupos`
- **Autenticación:** token de oficina.

**Request body:** el objeto grupo de §3.2 (sin `configuracion` obligatoria).

**Response 201** — el grupo creado:

```json
{
  "id": "grp_1",
  "pedidoId": "ped_abc",
  "nombre": "Conjuntos blancos",
  "tipoProducto": { "codigo": "KIT", "nombre": "Kit completo" },
  "cantidadContratada": 10,
  "politicaNumeracion": "LIBRE"
}
```

**Errores:** `401`, `403`, `404`, `409` R-B02 (cantidad contratada), `409` nombre de grupo duplicado en el pedido (`@@unique([pedidoId, nombre])`, `schema:463`).

### 4.2 `GET /api/grupos/:grupoId`

- **Método:** `GET`
- **Ruta:** `/api/grupos/:grupoId`
- **Autenticación:** token de oficina.

**Response 200** — grupo con configuración y resumen (sin las 28 filas; eso es §5.1):

```json
{
  "id": "grp_1",
  "pedidoId": "ped_abc",
  "nombre": "Conjuntos blancos",
  "tipoProducto": { "codigo": "KIT", "nombre": "Kit completo" },
  "cantidadContratada": 10,
  "politicaNumeracion": "LIBRE",
  "configuracion": [
    { "atributo": "CUELLO", "valor": "REDONDO" }
  ],
  "resumen": { "totalPrendas": 10, "porTalla": { "S": 2, "M": 5, "XL": 1 } }
}
```

**Errores:** `401`, `404`.

### 4.3 `PATCH /api/grupos/:grupoId/politica-numeracion`

- **Método:** `PATCH`
- **Ruta:** `/api/grupos/:grupoId/politica-numeracion`
- **Autenticación:** token de oficina.

**Request body:**

```json
{ "politicaNumeracion": "UNICA" }
```

**Response 200:**

```json
{
  "id": "grp_1",
  "nombre": "Conjuntos blancos",
  "politicaNumeracion": "UNICA",
  "mensaje": "Politica actualizada y propagada a las prendas del grupo."
}
```

Nota: el trigger nativo de `01_constraints.sql` propaga el cambio a las prendas.

**Errores:** `401`, `404`, `409` R-G06 (con duplicados existentes).

### 4.4 `PATCH /api/grupos/:grupoId/configuracion`

- **Método:** `PATCH`
- **Ruta:** `/api/grupos/:grupoId/configuracion`
- **Autenticación:** token de oficina.

**Request body:**

```json
{ "configuracion": [ { "atributo": "CUELLO", "valor": "CAMISERO" } ] }
```

**Response 200** — el grupo actualizado (misma forma de §4.2).

Nota: cambiar la configuración general **no toca excepciones** (R-B07).

**Errores:** `401`, `404`, `422` R-B06 (atributo obligatorio sin valor).

---

## 5. Tabla de prendas (Frontend 2/3)

### 5.1 `GET /api/grupos/:grupoId/prendas`

- **Método:** `GET`
- **Ruta:** `/api/grupos/:grupoId/prendas`
- **Autenticación:** token de oficina.

**Response 200** — la grilla de 28 filas. **Cada celda viene con su valor efectivo ya resuelto** (`excepcion ?? configuracionDelGrupo`, R-C01) y su **origen** (`Ruta...md:156`, R-C06 / R-E07):

```json
{
  "grupo": {
    "id": "grp_1",
    "nombre": "Conjuntos blancos",
    "tipoProducto": { "codigo": "KIT", "nombre": "Kit completo" },
    "politicaNumeracion": "UNICA"
  },
  "prendas": [
    {
      "id": "pr_1",
      "participanteId": "part_1",
      "nombrePersona": "Ana Rojas",
      "nombreEnPrenda": "ROJAS",
      "estadoParticipante": "CONFIRMADO",
      "producto": "KIT",
      "talla": "S",
      "numero": "2",
      "genero": "MUJER",
      "tipoPrenda": "VENTA",
      "esArquero": false,
      "color": { "id": "col_1", "nombre": "Blanco hueso", "codigoHex": "#F7F4F2" },
      "valores": [
        { "atributo": "CUELLO", "valor": "REDONDO",  "origen": "HEREDADO" },
        { "atributo": "TELA",   "valor": "DRY_FIT",  "origen": "HEREDADO" },
        { "atributo": "CORTE",  "valor": "ENTALLADO", "origen": "EXCEPCION", "motivo": "Corte femenino" }
      ],
      "personalizaciones": [
        { "ubicacion": "CUELLO_DELANTERO", "contenido": "Nombre de la esposa" }
      ]
    }
  ]
}
```

Notas: `origen` = `HEREDADO | EXCEPCION` (R-C08 / R-H06: la excepción se destaca). `numero` es **texto** (R-K04): `"7"`, `"S/N"`. Si `politicaNumeracion === UNICA` el backend ya rechazó duplicados al guardar (`409` R-G03).

**Errores:** `401`, `404`, `409` R-H12 (grupo bajo bloque `CERRADO`).

### 5.2 `PATCH /api/prendas/:id`

- **Método:** `PATCH`
- **Ruta:** `/api/prendas/:id`
- **Autenticación:** token de oficina (Coordinador) o del participante dueño de la prenda (enlace).

**Request body** — edición en línea: cualquier campo de la fila, o el delta de atributos:

```json
{ "talla": "M" }
```

```json
{ "valores": [ { "atributo": "CORTE", "valor": "ENTALLADO", "motivo": "Corte femenino" } ] }
```

**Response 200** — la prenda actualizada (misma forma de §5.1).

Notas: si el valor enviado **coincide con el del grupo** se interpreta como "borrar la excepción" (R-C05: una excepción idéntica es inválida).

**Errores:** `401`, `403`, `404`, `422` R-C05 (excepción idéntica al grupo), `409` R-H12 (bloque cerrado), `409` R-G03 (número duplicado bajo UNICA).

### 5.3 `GET /api/pedidos/:id/resumen-produccion`

- **Método:** `GET`
- **Ruta:** `/api/pedidos/:id/resumen-produccion`
- **Autenticación:** token de oficina (rol PRODUCCIÓN o COORDINADOR_OPERATIVO).

**Response 200** — resumen calculado **siempre** sobre prendas × BOM del producto (R-K03, R-E07). Nunca un conteo escrito a mano:

```json
{
  "totalPrendas": 10,
  "porProducto": [
    { "productoCodigo": "KIT", "cantidad": 6 },
    { "productoCodigo": "CAMISETA", "cantidad": 4 }
  ],
  "componentes": { "camisetas": 10, "shorts": 6, "medias": 6 },
  "importeTotal": 285.00,
  "importeObsequioMuestra": 0.00
}
```

Notas: las prendas `OBSEQUIO`/`MUESTRA` cuentan para producción pero no para el importe (R-K02). Los precios salen de `/api/tarifas` vigentes (R-K10).

**Errores:** `401`, `403`, `404`.

---

## 6. Participantes y enlace público (BK2)

### 6.1 `POST /api/grupos/:grupoId/participantes`

- **Método:** `POST`
- **Ruta:** `/api/grupos/:grupoId/participantes`
- **Autenticación:** token de oficina.

**Request body:**

```json
{
  "nombrePersona": "Clint Eastwood",
  "prendas": []
}
```

**Response 201** — el participante con su `enlaceToken` generado (R-D05): ver §6.2.

**Errores:** `401`, `403`, `404`.

### 6.2 `GET /api/participantes/:id`

- **Método:** `GET`
- **Ruta:** `/api/participantes/:id`
- **Autenticación:** token de oficina.

**Response 200** — participante con sus prendas (misma forma de prenda de §5.1) y su enlace:

```json
{
  "id": "part_1",
  "grupoId": "grp_1",
  "nombrePersona": "Clint Eastwood",
  "estado": "CONFIRMADO",
  "enlaceToken": "tok_abc123",
  "enlaceExpiraEn": "2026-09-19T10:00:00Z",
  "prendas": []
}
```

`estado` ∈ `PENDIENTE | REGISTRADO | CONFIRMADO` (R-D03).

**Errores:** `401`, `404`.

### 6.3 Enlace público (sin JWT — token personal)

| Método | Ruta | Rol | Errores |
| --- | --- | --- | --- |
| `GET` | `/api/enlace/:enlaceToken` | participante | `404`/`403` revocado, `410` expirado |
| `PUT` | `/api/enlace/:enlaceToken/ficha` | participante | edita **sus propias** prendas (nombreEnPrenda, talla, número, personalizaciones) |
| `POST` | `/api/enlace/:enlaceToken/confirmar` | participante | confirma (R-D03). Personalización re-tecleada tras confirmar → `403` R-F05 |

Personalizaciones: el contenido se muestra con la ortografía exacta con que se registró (R-F04); una por `(prendaId, ubicacionId)` (R-F03).

---

## 7. Alcance del contrato

**Entregable del backend, día 3 del Sprint 1.** Lo escriben Backend 1 y Backend 2 ANTES de implementar; es lo que desbloquea a los tres frentes para trabajar contra el simulador (`Ruta...md:147,171,188`).

**Incluido** (Sprint 1, bloques A/B/D/E + K02/K03/K04):

- Catálogos y tarifas de lectura (§2).
- Pedidos: lista, creación, detalle, transición de estado (§3).
- Grupos: creación, configuración, política de numeración (§4).
- Tabla de prendas con valor efectivo + origen (§5).
- Participantes y enlace público (§6).

**Fuera de alcance** (el schema ya los modela; los endpoints llegan en sprints siguientes):

- `BloquePedido` / `VersionBloque` (cierres R-H11-H14): solo lectura de `estado` en el detalle.
- `Confirmacion`, `DatosEnvio`, `Nesting`, `ArchivoTif`, `RegistroCambio`, `EventoGhl`, `Diseno`.
- GoHighLevel (R-A*): aplazado por decisión del 2026-09-06.

---

## 8. Invariantes que el backend debe respetar (y el simulador igual)

Si la implementación se aparta de esto, el frontend desarrollará contra algo que el modelo real jamás puede producir:

1. **Los ids de catálogo son los `codigo` del schema**, no `prod_cam_short_01` ni similares: `CAMISETA_SHORT`, `KIT`, `XL`, `PUMA`, `CAMISERO`, `TERMOSELLADO`, `CUELLO`, `CORTE`.
2. Las tallas solo existen dentro de un producto (R-E04, clave compuesta `schema:372`).
3. Los errores siempre usan el shape `{error:{codigo,mensaje,detalle}}` con código R-*.
4. No existe `grupo` singular en el detalle del pedido: es `grupos[]`.
5. Los precios nunca se guardan en la prenda ni en la respuesta del pedido: se calculan de `/api/tarifas` vigentes (R-K10).