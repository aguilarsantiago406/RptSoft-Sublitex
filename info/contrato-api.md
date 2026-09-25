# SIPES — Contrato Oficial de APIs: Backend Completo (BK1 Núcleo Comercial + BK2 Operación Prendas)

**Frentes:** Backend 1 (BK1 - Núcleo Comercial) y Backend 2 (BK2 - Operación Prendas)  
**Versión:** 3.0.0 (Auditoría Técnica Consolidada — 100% de Endpoints y Campos Sincronizados con Código y Swagger)  
**Base URL:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api/docs`  
**Autenticación General:** Rutas protegidas requieren Header `Authorization: Bearer <JWT>`  

---

## 1. Módulo Autenticación y Usuarios (BK1)

### `POST /api/auth/login`
**Descripción:** Autentica a un usuario y genera un token JWT de acceso.  
**Seguridad:** Público (sin token)  
**Request Body:**
```json
{
  "email": "usuario@sublitex.com",
  "password": "password123"
}
```
**Campos Request:**
- `email` (string, formato email, REQUERIDO)
- `password` (string, REQUERIDO)

**Response Body (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "cuid_usr_01",
    "email": "usuario@sublitex.com",
    "nombre": "Santiago Asesor",
    "rol": "VENDEDORA",
    "activo": true
  }
}
```
**Errores:** `400 Bad Request` (campos inválidos), `401 Unauthorized` (credenciales incorrectas o usuario inactivo).

---

### `POST /api/auth/register`
**Descripción:** Registra un nuevo usuario en la plataforma.  
**Seguridad:** Requiere JWT y rol `ADMINISTRADOR`.  
**Request Body:**
```json
{
  "email": "vendedora2@sublitex.com",
  "password": "password123",
  "nombre": "Lucía Vendedora",
  "rol": "VENDEDORA",
  "activo": true
}
```
**Campos Request:**
- `email` (string, formato email, REQUERIDO)
- `password` (string, mínimo 6 caracteres, REQUERIDO)
- `nombre` (string, REQUERIDO)
- `rol` (enum: `ADMINISTRADOR` | `VENDEDORA` | `OPERADOR_PRENDAS` | `PRODUCCION`, REQUERIDO)
- `activo` (boolean, opcional, por defecto `true`)

**Response Body (201 Created):**
```json
{
  "id": "cuid_usr_02",
  "email": "vendedora2@sublitex.com",
  "nombre": "Lucía Vendedora",
  "rol": "VENDEDORA",
  "activo": true,
  "creadoEn": "2026-09-24T12:00:00.000Z",
  "actualizadoEn": "2026-09-24T12:00:00.000Z"
}
```
**Errores:** `400 Bad Request`, `401 Unauthorized`, `403 Forbidden` (no admin), `409 Conflict` (email ya registrado).

---

### `GET /api/auth/me`
**Descripción:** Retorna los datos del usuario autenticado a partir del JWT.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):**
```json
{
  "id": "cuid_usr_01",
  "email": "usuario@sublitex.com",
  "nombre": "Santiago Asesor",
  "rol": "ADMINISTRADOR",
  "activo": true,
  "creadoEn": "2026-09-24T12:00:00.000Z"
}
```

---

### `GET /api/auth`
**Descripción:** Lista todos los usuarios con filtro opcional por rol.  
**Seguridad:** Requiere JWT y rol `ADMINISTRADOR`.  
**Query Params:**
- `rol` (opcional): Filtro por rol (`ADMINISTRADOR`, `VENDEDORA`, etc.)

**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_usr_01",
    "email": "usuario@sublitex.com",
    "nombre": "Santiago Asesor",
    "rol": "ADMINISTRADOR",
    "activo": true,
    "creadoEn": "2026-09-24T12:00:00.000Z"
  }
]
```

---

### `GET /api/auth/:id`
**Descripción:** Obtiene el detalle de un usuario por su ID.  
**Seguridad:** Requiere JWT.  
**Path Params:**
- `id` (string, CUID del usuario, REQUERIDO)

**Response Body (200 OK):**
```json
{
  "id": "cuid_usr_01",
  "email": "usuario@sublitex.com",
  "nombre": "Santiago Asesor",
  "rol": "ADMINISTRADOR",
  "activo": true,
  "creadoEn": "2026-09-24T12:00:00.000Z",
  "actualizadoEn": "2026-09-24T12:00:00.000Z"
}
```
**Errores:** `404 Not Found` si el usuario no existe.

---

### `PATCH /api/auth/:id`
**Descripción:** Modifica los datos de un usuario (nombre, rol, estado activo).  
**Seguridad:** Requiere JWT y rol `ADMINISTRADOR`.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "nombre": "Santiago Director",
  "rol": "ADMINISTRADOR",
  "activo": true
}
```
**Campos Request (todos opcionales):**
- `nombre` (string)
- `rol` (enum: `ADMINISTRADOR` | `VENDEDORA` | `OPERADOR_PRENDAS` | `PRODUCCION`)
- `activo` (boolean)

**Response Body (200 OK):** Usuario actualizado.

---

### `PATCH /api/auth/:id/password`
**Descripción:** Cambia la contraseña de un usuario.  
**Seguridad:** Requiere JWT (propio usuario o `ADMINISTRADOR`).  
**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```
**Campos Request:**
- `currentPassword` (string, REQUERIDO)
- `newPassword` (string, mínimo 6 caracteres, REQUERIDO)

**Response Body (200 OK):**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

### `DELETE /api/auth/:id`
**Descripción:** Elimina a un usuario del sistema.  
**Seguridad:** Requiere JWT y rol `ADMINISTRADOR`.  
**Response Body (200 OK):** Usuario eliminado.

---

## 2. Módulo Clientes (BK1)

### `POST /api/clientes`
**Descripción:** Registra un nuevo cliente u organización.  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "nombre": "Colegio San Agustín - Promo 2026",
  "tipo": "PROMOCION",
  "telefono": "999888777",
  "ciudad": "Lima"
}
```
**Campos Request:**
- `nombre` (string, REQUERIDO)
- `tipo` (enum: `COLEGIO` | `PROMOCION` | `CLUB` | `EMPRESA` | `PARTICULAR`, REQUERIDO)
- `telefono` (string, opcional)
- `ciudad` (string, opcional)

**Response Body (201 Created):**
```json
{
  "id": "cuid_cli_01",
  "nombre": "Colegio San Agustín - Promo 2026",
  "tipo": "PROMOCION",
  "telefono": "999888777",
  "ciudad": "Lima",
  "activo": true,
  "creadoEn": "2026-09-24T12:00:00.000Z",
  "actualizadoEn": "2026-09-24T12:00:00.000Z"
}
```

---

### `GET /api/clientes`
**Descripción:** Lista todos los clientes con búsqueda insensible a mayúsculas sobre `nombre` y `ciudad`.  
**Seguridad:** Requiere JWT.  
**Query Params:**
- `q` (string, opcional): Término de búsqueda (ej. `?q=Lima` o `?q=Agustin`).

**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_cli_01",
    "nombre": "Colegio San Agustín - Promo 2026",
    "tipo": "PROMOCION",
    "telefono": "999888777",
    "ciudad": "Lima",
    "activo": true,
    "creadoEn": "2026-09-24T12:00:00.000Z",
    "actualizadoEn": "2026-09-24T12:00:00.000Z"
  }
]
```

---

### `GET /api/clientes/:id`
**Descripción:** Obtiene el detalle de un cliente con el historial completo de sus pedidos.  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Response Body (200 OK):**
```json
{
  "id": "cuid_cli_01",
  "nombre": "Colegio San Agustín - Promo 2026",
  "tipo": "PROMOCION",
  "telefono": "999888777",
  "ciudad": "Lima",
  "activo": true,
  "creadoEn": "2026-09-24T12:00:00.000Z",
  "actualizadoEn": "2026-09-24T12:00:00.000Z",
  "pedidos": [
    {
      "id": "cuid_ped_01",
      "codigo": "SUB-0001",
      "estado": "BORRADOR",
      "fechaPedido": "2026-09-24T12:00:00.000Z",
      "fechaCompromiso": "2026-10-15T00:00:00.000Z",
      "observaciones": "Entrega para desfile escolar"
    }
  ]
}
```
**Errores:** `404 Not Found` ("Cliente no encontrado").

---

## 3. Módulo Pedidos, Colores y Conciliación (BK1)

### `POST /api/pedidos`
**Descripción:** Crea un nuevo pedido en estado inicial `BORRADOR` (R-A05) con código legible `SUB-XXXX` generado secuencialmente (R-A03).  
**Seguridad:** Requiere JWT. El usuario autenticado queda registrado como creador si no se envía `vendedoraId`.  
**Request Body:**
```json
{
  "clienteId": "cuid_cli_01",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "vendedoraId": "cuid_usr_vendedora",
  "observaciones": "Entrega prioritaria para desfile escolar"
}
```
**Campos Request:**
- `clienteId` (string CUID, REQUERIDO)
- `fechaCompromiso` (string ISO 8601, posterior al momento del pedido - R-A09, REQUERIDO)
- `vendedoraId` / `vendedorId` (string CUID, opcional. Se acepta indistintamente cualquiera de los dos nombres de campo)
- `observaciones` (string, opcional)

**Response Body (201 Created):**
```json
{
  "id": "cuid_ped_01",
  "codigo": "SUB-0001",
  "clienteId": "cuid_cli_01",
  "vendedoraId": "cuid_usr_vendedora",
  "estado": "BORRADOR",
  "fechaPedido": "2026-09-24T12:00:00.000Z",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "observaciones": "Entrega prioritaria para desfile escolar",
  "tiempoDias": 21,
  "canceladoEn": null,
  "creadoEn": "2026-09-24T12:00:00.000Z",
  "actualizadoEn": "2026-09-24T12:00:00.000Z"
}
```
**Errores:** `400 Bad Request` (fecha compromiso inválida o anterior a hoy - R-A09), `404 Not Found` (cliente o vendedora inexistente).

---

### `GET /api/pedidos`
**Descripción:** Lista todos los pedidos con soporte de filtros, incluyendo relación del cliente, vendedora asignada y cálculo dinámico de `tiempoDias`.  
**Seguridad:** Requiere JWT.  
**Query Params:**
- `estado` (enum: `BORRADOR` | `EN_CONFIGURACION` | `EN_RECOLECCION` | `EN_REVISION` | `EN_PRODUCCION` | `ENTREGADO` | `CERRADO` | `CANCELADO`, opcional)
- `clienteId` (string CUID, opcional)

**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_ped_01",
    "codigo": "SUB-0001",
    "clienteId": "cuid_cli_01",
    "vendedoraId": "cuid_usr_02",
    "estado": "BORRADOR",
    "fechaPedido": "2026-09-24T12:00:00.000Z",
    "fechaCompromiso": "2026-10-15T00:00:00.000Z",
    "observaciones": "Entrega prioritaria",
    "tiempoDias": 21,
    "cliente": {
      "id": "cuid_cli_01",
      "nombre": "Colegio San Agustín - Promo 2026",
      "tipo": "PROMOCION",
      "ciudad": "Lima"
    },
    "vendedora": {
      "id": "cuid_usr_02",
      "nombre": "Lucía Vendedora",
      "email": "vendedora2@sublitex.com"
    }
  }
]
```

---

### `GET /api/pedidos/:id`
**Descripción:** Detalle completo de un pedido por ID o código (SUB-XXXX), incluyendo cliente, vendedora, grupos con tipoProducto y colores oficiales.  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID o código SUB-XXXX, REQUERIDO)  
**Response Body (200 OK):**
```json
{
  "id": "cuid_ped_01",
  "codigo": "SUB-0001",
  "clienteId": "cuid_cli_01",
  "vendedoraId": "cuid_usr_02",
  "estado": "BORRADOR",
  "fechaPedido": "2026-09-24T12:00:00.000Z",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "observaciones": "Entrega prioritaria",
  "tiempoDias": 21,
  "cliente": {
    "id": "cuid_cli_01",
    "nombre": "Colegio San Agustín - Promo 2026",
    "tipo": "PROMOCION",
    "ciudad": "Lima"
  },
  "vendedora": {
    "id": "cuid_usr_02",
    "nombre": "Lucía Vendedora",
    "email": "vendedora2@sublitex.com"
  },
  "grupos": [
    {
      "id": "cuid_grp_01",
      "nombre": "Conjunto Titular Alumnos",
      "politicaNumeracion": "LIBRE",
      "cantidadContratada": 28,
      "tipoProducto": {
        "id": "cuid_tp_01",
        "nombre": "Camiseta + Short",
        "piezasFisicas": { "camisetas": 1, "shorts": 1 }
      }
    }
  ],
  "colores": [
    {
      "id": "cuid_col_01",
      "nombre": "Azul Marino",
      "codigoHex": "#001489",
      "referenciaFisica": "Pantone 287C"
    }
  ]
}
```

---

### `PATCH /api/pedidos/:id`
**Descripción:** Actualiza los datos generales de un pedido (`fechaCompromiso`, `vendedoraId`, `observaciones`). Valida que `fechaCompromiso` siga siendo posterior a la `fechaPedido` (R-A09).  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "fechaCompromiso": "2026-11-01T00:00:00.000Z",
  "vendedoraId": "cuid_usr_nueva_vendedora",
  "observaciones": "Actualización de observaciones por cambio de fecha"
}
```
**Campos Request (todos opcionales):**
- `fechaCompromiso` (string ISO 8601, posterior a fechaPedido - R-A09)
- `vendedoraId` / `vendedorId` (string CUID, asesor/a reasignado/a. Se admite cualquiera de las dos propiedades)
- `observaciones` (string)

**Response Body (200 OK):** Pedido actualizado con nuevo `tiempoDias`.  
**Errores:** `400 Bad Request` (fechaCompromiso inválida o no posterior a fechaPedido), `404 Not Found`.

---

### `PATCH /api/pedidos/:id/estado`
**Descripción:** Ejecuta una transición de estado controlada sobre el ciclo de vida del pedido (R-A06). Solo admite transiciones declaradas hacia adelante, o `CANCELADO` desde cualquier estado no terminal.  
**Seguridad:** Requiere JWT.  
**Transiciones Válidas:**
`BORRADOR` → `EN_CONFIGURACION` → `EN_RECOLECCION` → `EN_REVISION` → `EN_PRODUCCION` → `ENTREGADO` → `CERRADO` (o `CANCELADO`).  
**Request Body:**
```json
{
  "estado": "EN_CONFIGURACION",
  "motivo": "Aprobación inicial de ficha técnica"
}
```
**Campos Request:**
- `estado` (enum `EstadoPedido`, REQUERIDO)
- `motivo` (string, opcional para trazabilidad)

**Response Body (200 OK):**
```json
{
  "id": "cuid_ped_01",
  "codigo": "SUB-0001",
  "estado": "EN_CONFIGURACION",
  "tiempoDias": 21,
  "actualizadoEn": "2026-09-24T12:30:00.000Z"
}
```
**Errores:** `400 Bad Request` (transición ilegal, salto de etapa o retroceso), `404 Not Found`.

---

### `GET /api/pedidos/:id/resumen-produccion`
**Alias:** `POST /api/pedidos/:id/resumen-produccion` y `GET /api/pedidos/:id/conciliacion-comercial`  
**Descripción:** Calcula el balance operativo entre la cantidad contratada de cada grupo y las prendas efectivamente registradas (R-B02, R-H03, R-K03).  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Response Body (200 OK):**
```json
{
  "pedidoId": "cuid_ped_01",
  "codigo": "SUB-0001",
  "grupos": [
    {
      "grupoId": "cuid_grp_01",
      "nombre": "Conjunto Titular Alumnos",
      "cantidadContratada": 28,
      "totalPrendasRegistradas": 28,
      "diferencia": 0,
      "completo": true
    }
  ],
  "totalContratado": 28,
  "totalRegistrado": 28,
  "balanceGeneral": 0
}
```

---

### `POST /api/pedidos/:id/colores`
**Descripción:** Registra uno o varios colores oficiales del pedido con su código HEX obligatorio (R-K05).  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Request Body (objeto único o arreglo):**
```json
{
  "nombre": "Azul Marino Oficial",
  "codigoHex": "#001489",
  "referenciaFisica": "Pantone 287C"
}
```
o como arreglo:
```json
[
  { "nombre": "Azul Marino", "codigoHex": "#001489" },
  { "nombre": "Blanco Puro", "codigoHex": "#FFFFFF" }
]
```
**Campos Request:**
- `nombre` (string, REQUERIDO, no repetible en el pedido)
- `codigoHex` (string formato `#RRGGBB` estricto, REQUERIDO)
- `referenciaFisica` (string, opcional)

**Response Body (201 Created):** Objeto o arreglo de colores creados.  
**Errores:** `400 Bad Request` (HEX inválido o nombre duplicado), `404 Not Found`.

---

### `GET /api/pedidos/:id/colores`
**Descripción:** Lista todos los colores registrados en la paleta oficial del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Array de colores `[{ id, pedidoId, nombre, codigoHex, referenciaFisica }]`.

---

### `DELETE /api/pedidos/:id/colores/:colorId`
**Descripción:** Elimina un color de la paleta oficial del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Color eliminado.

---

### `POST /api/pedidos/:id/confirmaciones`
**Alias:** `POST /api/comercial/pedidos/:pedidoId/confirmacion`  
**Descripción:** Emite una versión congelada e inmutable de confirmación comercial del pedido (R-H05, R-K06, R-K07). Incrementa el número de versión (`SUB-XXXX-v1`, `v2`, etc.), calcula automáticamente el subtotal sin IGV con recargos de tallas, telas, cuellos y acabados (R-H07 / R-H08), el adelanto requerido al 50% y el saldo pendiente.  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "adelantoRecibido": 500.00,
  "comprobante": "FACTURA",
  "pdfUrl": "https://storage.sublitex.com/confirmaciones/SUB-0001-v1.pdf",
  "recargoTallas": 25.00,
  "recargoTelas": 30.00,
  "recargoCuellos": 15.00,
  "recargoAcabados": 10.00,
  "adicionales": 40.00
}
```
**Campos Request (todos opcionales):**
- `adelantoRecibido` (number >= 0)
- `comprobante` (enum: `BOLETA` | `FACTURA` | `RECIBO` | `NINGUNO`)
- `pdfUrl` (string URL)
- `recargoTallas` (number >= 0)
- `recargoTelas` (number >= 0)
- `recargoCuellos` (number >= 0)
- `recargoAcabados` (number >= 0)
- `adicionales` (number >= 0)

**Response Body (201 Created):**
```json
{
  "id": "cuid_conf_01",
  "pedidoId": "cuid_ped_01",
  "version": 1,
  "totalSinIgv": 1120.00,
  "recargoTallas": 25.00,
  "recargoTelas": 30.00,
  "recargoCuellos": 15.00,
  "recargoAcabados": 10.00,
  "adicionales": 40.00,
  "adelantoSugerido": 560.00,
  "adelantoRecibido": 500.00,
  "saldo": 620.00,
  "comprobante": "FACTURA",
  "pdfUrl": "https://storage.sublitex.com/confirmaciones/SUB-0001-v1.pdf",
  "emitidoEn": "2026-09-24T12:45:00.000Z"
}
```

---

### `GET /api/pedidos/:id/confirmaciones`
**Alias:** `GET /api/comercial/pedidos/:pedidoId/confirmaciones`  
**Descripción:** Lista el historial completo de confirmaciones comerciales emitidas para un pedido, ordenadas por versión descendente (R-K06).  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Response Body (200 OK):** Array de confirmaciones ordenadas por version desc.

---

## 4. Módulo Gobernanza de Bloques (BloquePedido y VersionBloque - BK1)

### `GET /api/pedidos/:id/bloques`
**Descripción:** Consulta el estado consolidado de los 3 bloques (`DISENO`, `LISTA`, `COMERCIAL`) de un pedido (R-H01, R-H11). Si los bloques aún no están creados, los inicializa automáticamente en estado `ABIERTO`.  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_blq_01",
    "pedidoId": "cuid_ped_01",
    "tipo": "DISENO",
    "estado": "ABIERTO",
    "cerradoEn": null,
    "cerradoPor": null,
    "versiones": []
  },
  {
    "id": "cuid_blq_02",
    "pedidoId": "cuid_ped_01",
    "tipo": "LISTA",
    "estado": "CERRADO",
    "cerradoEn": "2026-09-24T12:00:00.000Z",
    "cerradoPor": { "id": "usr_1", "nombre": "Admin", "email": "admin@sublitex.com" },
    "versiones": [{ "numero": 1, "creadoEn": "2026-09-24T12:00:00.000Z" }]
  },
  {
    "id": "cuid_blq_03",
    "pedidoId": "cuid_ped_01",
    "tipo": "COMERCIAL",
    "estado": "ABIERTO",
    "cerradoEn": null,
    "cerradoPor": null,
    "versiones": []
  }
]
```

---

### `POST /api/pedidos/:id/bloques/:tipo/cerrar`
**Descripción:** Cierra formalmente un bloque del pedido y congela su snapshot inmutable en `VersionBloque` (R-H01, R-H03, R-H11). Para el bloque `LISTA`, valida que todas las prendas tengan talla, número y nombre (R-E03), que no haya números repetidos en política `UNICA` (R-G03), y que cuadre la cantidad contratada con las prendas registradas (R-B02).  
**Seguridad:** Requiere JWT.  
**Path Params:**
- `id` (string CUID, REQUERIDO)
- `tipo` (enum `TipoBloque`: `DISENO` | `LISTA` | `COMERCIAL`, REQUERIDO)  
**Response Body (201 Created):**
```json
{
  "bloque": {
    "id": "cuid_blq_02",
    "tipo": "LISTA",
    "estado": "CERRADO",
    "cerradoEn": "2026-09-24T12:30:00.000Z",
    "cerradoPor": { "id": "usr_1", "nombre": "Admin", "email": "admin@sublitex.com" }
  },
  "version": 1,
  "mensaje": "Bloque LISTA cerrado exitosamente"
}
```

---

### `POST /api/pedidos/:id/bloques/:tipo/reabrir`
**Descripción:** Reapertura formal de un bloque que se encuentra en estado `CERRADO` (R-H12, R-H13, R-H14). Exige motivo escrito obligatorio y genera una nueva versión inmutable con snapshot y diff. Si el pedido ya tiene partes en taller (`NestingParte`), activa la alerta de producción.  
**Seguridad:** Requiere JWT.  
**Path Params:**
- `id` (string CUID, REQUERIDO)
- `tipo` (enum `TipoBloque`: `DISENO` | `LISTA` | `COMERCIAL`, REQUERIDO)  
**Request Body:**
```json
{
  "motivoReapertura": "Cliente solicita cambio de tallas y agregado de arquero"
}
```
**Response Body (201 Created):**
```json
{
  "bloque": {
    "id": "cuid_blq_02",
    "tipo": "LISTA",
    "estado": "ABIERTO",
    "cerradoEn": null,
    "cerradoPorId": null
  },
  "version": {
    "id": "cuid_ver_02",
    "numero": 2,
    "motivoReapertura": "Cliente solicita cambio de tallas y agregado de arquero",
    "creadoEn": "2026-09-24T12:45:00.000Z"
  },
  "alertaTaller": false,
  "mensaje": "Bloque reabierto exitosamente"
}
```

---

## 5. Módulo Grupos de Pedido (BK1)

### `POST /api/pedidos/:id/grupos`
**Descripción:** Crea un grupo dentro del pedido (R-B01, R-B02, R-G01). El nombre debe ser único dentro del pedido.  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID del pedido, REQUERIDO)  
**Request Body:**
```json
{
  "nombre": "Conjunto Titular Alumnos",
  "politicaNumeracion": "LIBRE",
  "tipoProductoId": "cuid_tp_01",
  "cantidadContratada": 28,
  "observaciones": "Con escudo al frente"
}
```
**Campos Request:**
- `nombre` (string, REQUERIDO)
- `politicaNumeracion` (enum: `LIBRE` | `UNICA`, REQUERIDO)
- `tipoProductoId` (string CUID, REQUERIDO)
- `cantidadContratada` (entero >= 1, REQUERIDO)
- `observaciones` (string, opcional)

**Response Body (201 Created):** Grupo creado con su ID y configuración.  
**Errores:** `404 Not Found` (pedido o tipo producto no existe), `409 Conflict` (nombre duplicado en el pedido - R-B01).

---

### `GET /api/pedidos/:id/grupos`
**Descripción:** Lista todos los grupos pertenecientes al pedido, incluyendo tipo de producto y configuración de atributos.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Array de grupos con su detalle.

---

### `GET /api/grupos/:id`
**Descripción:** Obtiene el detalle de un grupo específico por su ID.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Grupo con `tipoProducto` y `configuracion`.

---

### `PATCH /api/grupos/:id` (y `PUT /api/grupos/:id`)
**Descripción:** Actualiza los campos de un grupo y su configuración de atributos por defecto (R-B03, R-B07).  
**Seguridad:** Requiere JWT.  
**Path Params:** `id` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "nombre": "Conjunto Titular Alumnos Actualizado",
  "politicaNumeracion": "UNICA",
  "cantidadContratada": 30,
  "observaciones": "Se aumentó cupo a 30",
  "configuracion": [
    { "atributoId": "cuid_attr_cuello", "valorAtributoId": "cuid_val_v" },
    { "atributoId": "cuid_attr_manga", "valorAtributoId": "cuid_val_corta" }
  ]
}
```
**Campos Request (todos opcionales):**
- `nombre` (string)
- `politicaNumeracion` (enum: `LIBRE` | `UNICA`)
- `tipoProductoId` (string CUID)
- `cantidadContratada` (entero >= 1)
- `observaciones` (string)
- `configuracion` (array de `{ atributoId: string, valorAtributoId: string }`)

**Response Body (200 OK):** Grupo actualizado con su configuración persistida.

---

### `PATCH /api/grupos/:id/politica`
**Descripción:** Cambia la política de numeración entre `LIBRE` y `UNICA` (R-G01). Si se intenta cambiar a `UNICA` y existen números repetidos, es bloqueado (R-G06).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "politicaNumeracion": "UNICA"
}
```
**Response Body (200 OK):** Grupo con la nueva política aplicada.  
**Errores:** `409 Conflict` si existen números repetidos en las prendas asociadas (R-G06).

---

### `DELETE /api/grupos/:id`
**Descripción:** Elimina un grupo que no posea prendas ni participantes asociados.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Grupo eliminado.  
**Errores:** `409 Conflict` si el grupo ya tiene participantes o prendas asociadas.

---

## 5. Módulo Catálogos Base (BK1)

### `GET /api/catalogos/tipos-producto` (o `/api/tipos-producto`)
**Descripción:** Lista los tipos de productos y sus piezas físicas asociadas (R-K03).  
**Seguridad:** Pública  
**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_tp_01",
    "nombre": "Camiseta + Short",
    "piezasFisicas": { "camisetas": 1, "shorts": 1, "medias": 0 }
  }
]
```

---

### `GET /api/catalogos/tallas`
**Descripción:** Lista las tallas permitidas, con filtro opcional por tipo de producto (R-E04).  
**Seguridad:** Pública  
**Query Params:**
- `tipoProductoId` (string CUID, opcional)

**Response Body (200 OK):**
```json
[
  { "id": "cuid_talla_s", "codigo": "S", "etiqueta": "Talla S", "tipoProductoId": "cuid_tp_01" },
  { "id": "cuid_talla_m", "codigo": "M", "etiqueta": "Talla M", "tipoProductoId": "cuid_tp_01" }
]
```

---

### `GET /api/catalogos/atributos`
**Descripción:** Lista los atributos técnicos con sus valores cerrados permitidos (R-B04).  
**Seguridad:** Pública  
**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_attr_cuello",
    "codigo": "CUELLO",
    "nombre": "Tipo de Cuello",
    "valores": [
      { "id": "cuid_val_redondo", "codigo": "REDONDO", "valor": "Cuello Redondo" },
      { "id": "cuid_val_v", "codigo": "V", "valor": "Cuello en V" }
    ]
  }
]
```

---

### `GET /api/catalogos/ubicaciones`
**Descripción:** Lista las ubicaciones válidas de personalización / estampado (R-F02).  
**Seguridad:** Pública  
**Response Body (200 OK):**
```json
[
  { "id": "cuid_ubic_espalda", "codigo": "ESPALDA_ALTA", "nombre": "Espalda Superior" },
  { "id": "cuid_ubic_pecho", "codigo": "PECHO_IZQ", "nombre": "Pecho Izquierdo" }
]
```

---

## 6. Módulo Comercial, Tarifas, Envíos y Confirmaciones (BK1)

### `POST /api/comercial/tarifas`
**Descripción:** Crea una nueva tarifa en el tarifario histórico (R-K10).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "tipo": "PRODUCTO",
  "concepto": "Conjunto Deportivo Base",
  "valor": 55.00,
  "vigenteDesde": "2026-01-01T00:00:00.000Z",
  "vigenteHasta": "2026-12-31T23:59:59.000Z",
  "nota": "Tarifa estándar institucional"
}
```
**Campos Request:**
- `tipo` (enum: `PRODUCTO` | `PERSONALIZACION` | `TALLA_ESPECIAL` | `ENVIO` | `DESCUENTO`, REQUERIDO)
- `concepto` (string, REQUERIDO)
- `valor` (number > 0, REQUERIDO)
- `vigenteDesde` (string ISO 8601, REQUERIDO)
- `vigenteHasta` (string ISO 8601, opcional)
- `nota` (string, opcional)

**Response Body (201 Created):** Tarifa registrada.  
**Errores:** `400 Bad Request` (rango de fechas inválido), `409 Conflict` (tarifa duplicada para mismo tipo, concepto y fecha).

---

### `GET /api/comercial/tarifas`
**Descripción:** Lista todas las tarifas registradas (históricas y actuales) con filtro opcional por `tipo`.  
**Seguridad:** Requiere JWT.  
**Query Params:** `tipo` (enum `TipoTarifa`, opcional)  
**Response Body (200 OK):** Array de tarifas.

---

### `GET /api/comercial/tarifas/vigentes`
**Descripción:** Lista únicamente las tarifas que se encuentran vigentes a la fecha actual.  
**Seguridad:** Requiere JWT.  
**Query Params:** `tipo` (enum `TipoTarifa`, opcional)  
**Response Body (200 OK):** Array de tarifas activas hoy.

---

### `GET /api/comercial/tarifas/:id`
**Descripción:** Obtiene una tarifa específica por su ID.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Detalle de tarifa.

---

### `PATCH /api/comercial/tarifas/:id`
**Descripción:** Actualiza los datos o vigencia de una tarifa.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Tarifa actualizada.

---

### `DELETE /api/comercial/tarifas/:id`
**Descripción:** Elimina una tarifa.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Tarifa eliminada.

---

### `POST /api/comercial/pedidos/:pedidoId/envio`
**Descripción:** Registra los datos de envío asociados a un pedido (R-K08).  
**Seguridad:** Requiere JWT.  
**Path Params:** `pedidoId` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "nombreCompleto": "Juan Pérez García",
  "dni": "12345678",
  "celular": "+51 999 888 777",
  "ciudad": "Arequipa",
  "agencia": "Olva Courier",
  "referencia": "Frente a la plaza principal",
  "correo": "juan@empresa.com"
}
```
**Campos Request:**
- `nombreCompleto` (string, 2-100 caracteres, REQUERIDO)
- `dni` (string, 7-20 caracteres, REQUERIDO)
- `celular` (string, 9-20 caracteres, REQUERIDO)
- `ciudad` (string, 2-100 caracteres, REQUERIDO)
- `agencia` (string, 2-100 caracteres, REQUERIDO)
- `referencia` (string, máx 200 caracteres, opcional)
- `correo` (string email, máx 100 caracteres, opcional)

**Response Body (201 Created):** Datos de envío creados.  
**Errores:** `409 Conflict` si el pedido ya tiene datos de envío.

---

### `GET /api/comercial/pedidos/:pedidoId/envio`
**Descripción:** Obtiene los datos de envío del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Objeto con datos de envío.

---

### `PATCH /api/comercial/pedidos/:pedidoId/envio`
**Descripción:** Actualiza los datos de envío del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Datos de envío actualizados.

---

### `DELETE /api/comercial/pedidos/:pedidoId/envio`
**Descripción:** Elimina los datos de envío del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Datos de envío eliminados.

---

### `POST /api/comercial/pedidos/:pedidoId/confirmacion`
**Descripción:** Emite una versión congelada e inmutable de confirmación comercial del pedido (R-H05, R-K06, R-K07). Incrementa el número de versión (`SUB-XXXX-v1`, `v2`, etc.), calcula automáticamente el subtotal sin IGV, el adelanto requerido al 50% y el saldo pendiente.  
**Seguridad:** Requiere JWT.  
**Path Params:** `pedidoId` (string CUID, REQUERIDO)  
**Request Body:**
```json
{
  "adelantoRecibido": 500.00,
  "comprobante": "FACTURA",
  "pdfUrl": "https://storage.sublitex.com/confirmaciones/SUB-0001-v1.pdf"
}
```
**Campos Request (todos opcionales):**
- `adelantoRecibido` (number >= 0, monto de adelanto recibido registrado)
- `comprobante` (enum: `BOLETA` | `FACTURA` | `RECIBO` | `NINGUNO`, por defecto `NINGUNO`)
- `pdfUrl` (string URL del comprobante o documento de confirmación)

**Response Body (201 Created):**
```json
{
  "id": "cuid_conf_01",
  "pedidoId": "cuid_ped_01",
  "version": 1,
  "totalSinIgv": 1000.00,
  "adelantoRequerido": 500.00,
  "adelantoRecibido": 500.00,
  "saldoPendiente": 500.00,
  "comprobante": "FACTURA",
  "pdfUrl": "https://storage.sublitex.com/confirmaciones/SUB-0001-v1.pdf",
  "emitidoEn": "2026-09-24T12:45:00.000Z"
}
```

---

### `GET /api/comercial/pedidos/:pedidoId/confirmaciones`
**Descripción:** Lista el historial completo de confirmaciones comerciales emitidas para un pedido, ordenadas por versión descendente (R-K06).  
**Seguridad:** Requiere JWT.  
**Path Params:** `pedidoId` (string CUID, REQUERIDO)  
**Response Body (200 OK):**
```json
[
  {
    "id": "cuid_conf_01",
    "pedidoId": "cuid_ped_01",
    "version": 1,
    "totalSinIgv": 1000.00,
    "adelantoRequerido": 500.00,
    "adelantoRecibido": 500.00,
    "saldoPendiente": 500.00,
    "comprobante": "FACTURA",
    "pdfUrl": "https://storage.sublitex.com/confirmaciones/SUB-0001-v1.pdf",
    "emitidoEn": "2026-09-24T12:45:00.000Z"
  }
]
```

---

## 7. Flujo Público del Participante (BK2)

### `GET /api/participantes/enlace/:token`
**Descripción:** Carga inicial de la pantalla del participante desde su celular. Devuelve sus datos, sus prendas y los catálogos contextuales disponibles sin requerir login ni JWT (R-D05).  
**Seguridad:** Pública (Token en URL)  
**Response Body (200 OK):**
```json
{
  "participante": {
    "id": "part_1002",
    "nombrePersona": "Ana Suárez",
    "estado": "PENDIENTE",
    "enlaceRevocado": false,
    "enlaceExpiraEn": "2026-09-17T23:59:59Z",
    "registradoEn": null,
    "confirmadoEn": null
  },
  "grupo": {
    "id": "grp_PROMO2002",
    "nombre": "Conjuntos blancos",
    "politicaNumeracion": "LIBRE"
  },
  "prendas": [
    {
      "id": "pre_2003",
      "tipoProductoId": "prod_cam_01",
      "tallaId": null,
      "numero": null,
      "genero": "MUJER",
      "nombreEnPrenda": null,
      "esArquero": false,
      "personalizaciones": [],
      "excepciones": []
    }
  ],
  "catalogos": {
    "tallasDisponibles": [
      { "id": "talla_S", "codigo": "S", "etiqueta": "Talla S" },
      { "id": "talla_M", "codigo": "M", "etiqueta": "Talla M" },
      { "id": "talla_L", "codigo": "L", "etiqueta": "Talla L" }
    ],
    "ubicacionesPersonalizacion": [
      { "id": "ubic_espalda_alta", "codigo": "ESPALDA_ALTA", "etiqueta": "Espalda Superior" }
    ]
  }
}
```
**Errores:** `410 Gone` si el enlace fue revocado o expiró (R-D06).

---

### `PUT /api/participantes/enlace/:token/ficha`
**Descripción:** Guarda la ficha mínima del participante (talla, número, nombre en prenda, género y personalizaciones) mediante su token personal. Cambia automáticamente el estado a `REGISTRADO` (R-D03) y sella `registradoEn`.  
**Seguridad:** Pública (Token en URL)  
**Request Body:**
```json
{
  "prendas": [
    {
      "prendaId": "pre_2003",
      "tallaId": "talla_M",
      "numero": "10",
      "genero": "MUJER",
      "nombreEnPrenda": "ANA",
      "personalizaciones": [
        {
          "ubicacionId": "ubic_espalda_alta",
          "contenido": "ANA"
        }
      ]
    }
  ]
}
```
**Response Body (200 OK):**
```json
{
  "id": "part_1002",
  "nombrePersona": "Ana Suárez",
  "estado": "REGISTRADO",
  "registradoEn": "2026-09-10T21:00:00Z",
  "confirmadoEn": null,
  "enlaceRevocado": false
}
```

---

### `POST /api/participantes/enlace/:token/confirmar`
**Descripción:** El participante da su visto bueno final a sus datos desde su enlace (R-D03). Pasa el estado a `CONFIRMADO` y sella `confirmadoEn`. Bloquea futuras ediciones del participante.  
**Seguridad:** Pública (Token en URL)  
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
{
  "id": "part_1002",
  "estado": "CONFIRMADO",
  "confirmadoEn": "2026-09-10T21:05:00Z"
}
```

---

## 8. Gestión Administrativa de Participantes (BK2)

### `POST /api/grupos/:grupoId/participantes`
**Descripción:** Registra un participante dentro de un grupo y genera su enlace personal sin contraseña (R-D05).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "nombrePersona": "Carlos Mendoza"
}
```
**Response Body (201 Created):**
```json
{
  "id": "part_1001",
  "grupoId": "grp_PROMO2002",
  "nombrePersona": "Carlos Mendoza",
  "estado": "PENDIENTE",
  "enlaceToken": "tok_carlos_mendoza_8492",
  "enlaceExpiraEn": "2026-09-17T23:59:59Z",
  "enlaceRevocado": false,
  "registradoEn": null,
  "confirmadoEn": null
}
```

---

### `GET /api/grupos/:grupoId/participantes`
**Descripción:** Lista todos los participantes de un grupo con sus prendas, personalizaciones y excepciones consolidadas.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Array de participantes con sus prendas.

---

### `GET /api/participantes/:id`
**Descripción:** Obtiene el detalle individual de un participante por su ID.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Detalle de participante con prendas y personalizaciones.

---

### `POST /api/participantes/:id/confirmar`
**Descripción:** Permite al coordinador dar por confirmado manualmente a un participante.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "estado": "CONFIRMADO",
  "confirmadoEn": "2026-09-10T21:10:00Z"
}
```

---

### `POST /api/participantes/:id/revocar-enlace`
**Descripción:** Revoca de inmediato el enlace de WhatsApp del participante para impedir más modificaciones (R-D06).  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "enlaceRevocado": true
}
```

---

### `POST /api/participantes/:id/regenerar-enlace`
**Descripción:** Genera un nuevo token único de enlace, reactiva el acceso y renueva la expiración por 7 días (R-D06).  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "enlaceToken": "tok_carlos_mendoza_new_9941",
  "enlaceExpiraEn": "2026-09-24T23:59:59Z",
  "enlaceRevocado": false
}
```

---

## 9. Módulo Prendas (BK2)

### `POST /api/prendas`
**Descripción:** Registra una prenda asociada a un participante. El precio se deriva en el servidor mediante la tarifa vigente (R-K10). Admite "S/N" en número (R-K04). Obsequios y muestras se registran con precio 0.00 (R-K02).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "participanteId": "part_1002",
  "grupoId": "grp_PROMO2002",
  "tipoProductoId": "prod_cam_01",
  "tallaId": "talla_L",
  "numero": "S/N",
  "genero": "MUJER",
  "tipoPrenda": "MUESTRA",
  "colorId": "col_blanco_03",
  "nombreEnPrenda": "ANA",
  "esArquero": true
}
```
**Campos Request:**
- `participanteId` (string CUID, REQUERIDO)
- `grupoId` (string CUID, REQUERIDO)
- `tipoProductoId` (string CUID, REQUERIDO)
- `tallaId` (string CUID, opcional en borrador)
- `numero` (string: número o `"S/N"`, opcional)
- `genero` (enum: `HOMBRE` | `MUJER` | `UNISEX`, REQUERIDO)
- `tipoPrenda` (enum: `VENTA` | `OBSEQUIO` | `MUESTRA`, REQUERIDO)
- `colorId` (string CUID, perteneciente a la paleta del pedido - R-K05)
- `nombreEnPrenda` (string, opcional)
- `esArquero` (boolean, opcional)

**Response Body (201 Created):**
```json
{
  "id": "pre_2003",
  "participanteId": "part_1002",
  "grupoId": "grp_PROMO2002",
  "tipoProductoId": "prod_cam_01",
  "tallaId": "talla_L",
  "numero": "S/N",
  "genero": "MUJER",
  "tipoPrenda": "MUESTRA",
  "colorId": "col_blanco_03",
  "nombreEnPrenda": "ANA",
  "esArquero": true,
  "precioCalculado": 0.00
}
```

---

### `PATCH /api/prendas/:id`
**Descripción:** Actualiza la ficha mínima de una prenda. Bloqueado si la lista del pedido está en bloque `CERRADO` (R-H03). Si el participante ya estaba confirmado, registra el evento en `RegistroCambio` (R-I01, R-I04).  
**Seguridad:** Requiere JWT.  
**Request Body:** Campos parciales de la prenda a actualizar.  
**Response Body (200 OK):** Prenda actualizada con nuevo precio recalculado.

---

### `DELETE /api/prendas/:id`
**Descripción:** Elimina una prenda del pedido.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Prenda eliminada.

---

## 10. Módulo Excepciones de Prenda / Deltas (BK2)

### `POST /api/excepciones-prenda`
**Descripción:** Registra un delta de configuración que sobrescribe un atributo específico para una prenda sin alterar el grupo (R-C01).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "prendaId": "pre_2001",
  "atributoId": "attr_cuello",
  "valorAtributoId": "val_cuello_v",
  "motivo": "Preferencia personal por comodidad"
}
```
**Campos Request:**
- `prendaId` (string CUID, REQUERIDO)
- `atributoId` (string CUID, REQUERIDO)
- `valorAtributoId` (string CUID, REQUERIDO)
- `motivo` (string, REQUERIDO)

**Response Body (201 Created):**
```json
{
  "id": "exc_3001",
  "prendaId": "pre_2001",
  "atributoId": "attr_cuello",
  "valorAtributoId": "val_cuello_v",
  "motivo": "Preferencia personal por comodidad"
}
```

---

### `DELETE /api/excepciones-prenda/:id`
**Descripción:** Elimina el delta de excepción y restaura la prenda al valor general del grupo.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Excepción eliminada.

---

## 11. Módulo Personalizaciones / Estampados (BK2)

### `POST /api/personalizaciones`
**Descripción:** Registra un estampado asociado a una prenda con su ubicación declarada y contenido (R-F01, R-F03).  
**Seguridad:** Requiere JWT.  
**Request Body:**
```json
{
  "prendaId": "pre_2001",
  "ubicacionId": "ubic_espalda_alta",
  "contenido": "MENDOZA"
}
```
**Campos Request:**
- `prendaId` (string CUID, REQUERIDO)
- `ubicacionId` (string CUID, REQUERIDO)
- `contenido` (string, REQUERIDO)

**Response Body (201 Created):** Personalización registrada.

---

### `DELETE /api/personalizaciones/:id`
**Descripción:** Elimina un estampado de la prenda.  
**Seguridad:** Requiere JWT.  
**Response Body (200 OK):** Personalización eliminada.

---

## 12. Catálogo Resumen Completo de Endpoints del Sistema

| # | Módulo | Método | Ruta HTTP | Descripción | Ámbito / Rol |
|---|---|---|---|---|---|
| **1** | Auth | `POST` | `/api/auth/login` | Iniciar sesión y obtener token JWT | Público |
| **2** | Auth | `POST` | `/api/auth/register` | Registrar nuevo usuario | Solo ADMINISTRADOR |
| **3** | Auth | `GET` | `/api/auth/me` | Obtener usuario autenticado actual | Autenticado |
| **4** | Auth | `GET` | `/api/auth` | Listar usuarios con filtro opcional por rol | Solo ADMINISTRADOR |
| **5** | Auth | `GET` | `/api/auth/:id` | Obtener detalle de usuario por ID | Autenticado |
| **6** | Auth | `PATCH` | `/api/auth/:id` | Actualizar nombre, rol o estado activo | Solo ADMINISTRADOR |
| **7** | Auth | `PATCH` | `/api/auth/:id/password` | Cambiar contraseña | Propio usuario / Admin |
| **8** | Auth | `DELETE` | `/api/auth/:id` | Eliminar usuario | Solo ADMINISTRADOR |
| **9** | Clientes | `POST` | `/api/clientes` | Crear cliente u organización | Autenticado |
| **10** | Clientes | `GET` | `/api/clientes` | Listar clientes (filtro ?q= en nombre y ciudad) | Autenticado |
| **11** | Clientes | `GET` | `/api/clientes/:id` | Detalle del cliente con sus pedidos | Autenticado |
| **12** | Pedidos | `POST` | `/api/pedidos` | Crear pedido con código SUB-XXXX y vendedoraId | Autenticado |
| **13** | Pedidos | `GET` | `/api/pedidos` | Listar pedidos con filtros (?estado, ?clienteId) y tiempoDias | Autenticado |
| **14** | Pedidos | `GET` | `/api/pedidos/:id` | Detalle de pedido con cliente, vendedora, grupos y colores | Autenticado |
| **15** | Pedidos | `PATCH` | `/api/pedidos/:id` | Actualizar fechaCompromiso, vendedoraId u observaciones | Autenticado |
| **16** | Pedidos | `PATCH` | `/api/pedidos/:id/estado` | Transición de estado del pedido (R-A06) | Autenticado |
| **17** | Pedidos | `GET` | `/api/pedidos/:id/resumen-produccion` | Resumen de piezas contratadas vs prendas registradas | Autenticado |
| **18** | Pedidos | `POST` | `/api/pedidos/:id/resumen-produccion` | Alias operativo POST para recalcular resumen | Autenticado |
| **19** | Pedidos | `GET` | `/api/pedidos/:id/conciliacion-comercial` | Alias de conciliación comercial | Autenticado |
| **20** | Colores | `POST` | `/api/pedidos/:id/colores` | Agregar color(es) oficial(es) HEX (R-K05) | Autenticado |
| **21** | Colores | `GET` | `/api/pedidos/:id/colores` | Listar colores oficiales del pedido | Autenticado |
| **22** | Colores | `DELETE` | `/api/pedidos/:id/colores/:colorId` | Eliminar color del pedido | Autenticado |
| **23** | Grupos | `POST` | `/api/pedidos/:id/grupos` | Crear grupo en el pedido (R-B01, R-B02, R-G01) | Autenticado |
| **24** | Grupos | `GET` | `/api/pedidos/:id/grupos` | Listar grupos del pedido con configuración | Autenticado |
| **25** | Grupos | `GET` | `/api/grupos/:id` | Detalle de grupo por ID | Autenticado |
| **26** | Grupos | `PUT` | `/api/grupos/:id` | Actualizar configuración del grupo | Autenticado |
| **27** | Grupos | `PATCH` | `/api/grupos/:id` | Actualizar campos y configuración de grupo (R-B03, R-B07) | Autenticado |
| **28** | Grupos | `PATCH` | `/api/grupos/:id/politica` | Cambiar política LIBRE / UNICA con validación (R-G06) | Autenticado |
| **29** | Grupos | `DELETE` | `/api/grupos/:id` | Eliminar grupo sin dependencias | Autenticado |
| **30** | Catálogos | `GET` | `/api/catalogos/tipos-producto` | Listar tipos de producto y piezas físicas | Público |
| **31** | Catálogos | `GET` | `/api/catalogos/tallas` | Listar tallas por tipo de producto (R-E04) | Público |
| **32** | Catálogos | `GET` | `/api/catalogos/atributos` | Listar atributos técnicos y valores cerrados (R-B04) | Público |
| **33** | Catálogos | `GET` | `/api/catalogos/ubicaciones` | Listar ubicaciones válidas de estampado (R-F02) | Público |
| **34** | Comercial | `POST` | `/api/comercial/tarifas` | Crear tarifa en el tarifario (R-K10) | Autenticado |
| **35** | Comercial | `GET` | `/api/comercial/tarifas` | Listar todas las tarifas históricas y vigentes | Autenticado |
| **36** | Comercial | `GET` | `/api/comercial/tarifas/vigentes` | Listar tarifas vigentes a la fecha actual | Autenticado |
| **37** | Comercial | `GET` | `/api/comercial/tarifas/:id` | Obtener tarifa por ID | Autenticado |
| **38** | Comercial | `PATCH` | `/api/comercial/tarifas/:id` | Actualizar tarifa | Autenticado |
| **39** | Comercial | `DELETE` | `/api/comercial/tarifas/:id` | Eliminar tarifa | Autenticado |
| **40** | Comercial | `POST` | `/api/comercial/pedidos/:pedidoId/envio` | Crear datos de envío del pedido (R-K08) | Autenticado |
| **41** | Comercial | `GET` | `/api/comercial/pedidos/:pedidoId/envio` | Obtener datos de envío del pedido | Autenticado |
| **42** | Comercial | `PATCH` | `/api/comercial/pedidos/:pedidoId/envio` | Actualizar datos de envío | Autenticado |
| **43** | Comercial | `DELETE` | `/api/comercial/pedidos/:pedidoId/envio` | Eliminar datos de envío | Autenticado |
| **44** | Comercial | `POST` | `/api/comercial/pedidos/:pedidoId/confirmacion` | Emitir confirmación comercial congelada (R-H05, R-K06) | Autenticado |
| **45** | Comercial | `GET` | `/api/comercial/pedidos/:pedidoId/confirmaciones` | Historial de confirmaciones del pedido | Autenticado |
| **46** | Pedidos | `POST` | `/api/pedidos/:id/confirmaciones` | Alias directo de emisión de confirmación comercial | Autenticado |
| **47** | Pedidos | `GET` | `/api/pedidos/:id/confirmaciones` | Alias directo de historial de confirmaciones | Autenticado |
| **48** | Bloques | `GET` | `/api/pedidos/:id/bloques` | Consultar estado consolidado de los 3 bloques (R-H01, R-H11) | Autenticado |
| **49** | Bloques | `POST` | `/api/pedidos/:id/bloques/:tipo/cerrar` | Cierre formal de bloque con validaciones y snapshot (R-H11) | Autenticado |
| **50** | Bloques | `POST` | `/api/pedidos/:id/bloques/:tipo/reabrir` | Reapertura formal con motivo y alerta de taller (R-H12..H14) | Autenticado |
| **51** | Participantes (Enlace) | `GET` | `/api/participantes/enlace/:token` | Carga ficha del participante con catálogos contextuales | Público (Sin JWT) |
| **52** | Participantes (Enlace) | `PUT` | `/api/participantes/enlace/:token/ficha` | Guarda ficha mínima, pasa a `REGISTRADO` (R-D03) | Público (Sin JWT) |
| **53** | Participantes (Enlace) | `POST` | `/api/participantes/enlace/:token/confirmar` | Visto bueno final del participante, pasa a `CONFIRMADO` | Público (Sin JWT) |
| **54** | Participantes (Admin) | `POST` | `/api/grupos/:grupoId/participantes` | Crea participante en grupo y genera token de enlace (R-D05) | Autenticado |
| **55** | Participantes (Admin) | `GET` | `/api/grupos/:grupoId/participantes` | Lista participantes del grupo con prendas completas | Autenticado |
| **56** | Participantes (Admin) | `GET` | `/api/participantes/:id` | Detalle individual de un participante | Autenticado |
| **57** | Participantes (Admin) | `POST` | `/api/participantes/:id/confirmar` | Confirmación manual administrativa de un participante | Autenticado |
| **58** | Participantes (Admin) | `POST` | `/api/participantes/:id/revocar-enlace` | Revoca de inmediato el acceso por enlace (R-D06) | Autenticado |
| **59** | Participantes (Admin) | `POST` | `/api/participantes/:id/regenerar-enlace` | Genera nuevo token y renueva vigencia por 7 días (R-D06) | Autenticado |
| **60** | Prendas | `POST` | `/api/prendas` | Crea prenda (venta/obsequio/muestra) para un participante | Autenticado |
| **61** | Prendas | `PATCH` | `/api/prendas/:id` | Actualiza ficha mínima (talla, número, género, apodo) | Autenticado |
| **62** | Prendas | `DELETE` | `/api/prendas/:id` | Elimina una prenda del pedido | Autenticado |
| **63** | Excepciones Prenda | `POST` | `/api/excepciones-prenda` | Registra delta de configuración sobre prenda (R-C01) | Autenticado |
| **64** | Excepciones Prenda | `DELETE` | `/api/excepciones-prenda/:id` | Elimina delta y devuelve prenda al valor del grupo | Autenticado |
| **65** | Personalizaciones | `POST` | `/api/personalizaciones` | Registra estampado con ubicación declarada (R-F01) | Autenticado |
| **66** | Personalizaciones | `DELETE` | `/api/personalizaciones/:id` | Elimina estampado de una prenda | Autenticado |
