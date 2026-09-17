# Contrato Oficial de API - SIPES Backend (BK1)
Responsable: BK1 (Guardian de Arquitectura - Santiago)
Alcance: Modulos de Clientes, Pedidos y Grupos con Politicas de Numeracion
Version: 0.2 + bloque K
Fecha de corte: 16 de septiembre de 2026

Este documento define las especificaciones exactas de entrada (Request) y salida (Response) para los endpoints a cargo de BK1, sincronizados con el modelo relacional de PostgreSQL, Prisma (schema.prisma), el contrato de BK2 y los tipos del Frontend (sublitex-web).

## 0. Fuente canónica e integración con BK2

La implementación de BK1 vive en `src/` y su modelo activo en `prisma/`.
Las reglas oficiales provienen de `01___Manual_SIPES.md` y
`02___Catálogo_de_reglas.md`. El fixture de integración es
`SIPES-repo/fixtures/PROMO2002_prendas.csv`.

BK2 mantiene su contrato en `..\contrato_api.md` y consume las llaves y
catálogos expuestos por BK1. BK1 entrega `pedidoId`, `grupoId`,
`tipoProductoId`, `cantidadContratada` y `colorId`; BK2 es propietario de
participantes, prendas, excepciones y personalizaciones. Ningún endpoint BK2 se
duplica en este contrato.

La correspondencia de entidades y ownership está documentada en
`.context/BK1_TABLES.md`. El diagrama ER `Pedido Management
Cascade-2026-09-15-152443.svg` valida la estructura del modelo; las entidades
de fases posteriores permanecen en Prisma sin exponerse desde BK1.

---

## 1. MODULO: CLIENTES (/api/clientes)

### 1.1 Registrar Nuevo Cliente
Permite dar de alta a un cliente u organizacion (Colegio, Promocion, Club, Empresa o Particular).

- Metodo: POST
- Ruta: /api/clientes
- Headers: Content-Type: application/json

#### Request Body:
```json
{
  "tipo": "PROMOCION",
  "nombre": "Promocion 2002 - Colegio San Jose",
  "telefono": "999888777",
  "ciudad": "Lima"
}
```
Tipos de cliente permitidos (tipo): COLEGIO | PROMOCION | CLUB | EMPRESA | PARTICULAR

#### Response (201 Created):
```json
{
  "id": "cm7a18b201b5e4c129c1a821f",
  "tipo": "PROMOCION",
  "nombre": "Promocion 2002 - Colegio San Jose",
  "telefono": "999888777",
  "ciudad": "Lima",
  "activo": true,
  "creadoEn": "2026-09-11T14:30:00.000Z",
  "actualizadoEn": "2026-09-11T14:30:00.000Z"
}
```

---

### 1.2 Listar Clientes
Permite al Frontend poblar el selector y buscador de clientes al crear un pedido.

- Metodo: GET
- Ruta: /api/clientes

#### Response (200 OK):
```json
[
  {
    "id": "cm7a18b201b5e4c129c1a821f",
    "tipo": "PROMOCION",
    "nombre": "Promocion 2002 - Colegio San Jose",
    "telefono": "999888777",
    "ciudad": "Lima",
    "activo": true
  }
]
```

---

## 2. MODULO: PEDIDOS (/api/pedidos)

### 2.1 Listar Pedidos (Vista Principal del Sistema)
Lista resumida de todos los pedidos para la pantalla principal del Coordinador y Vendedora.
Requerido por: Frontend FN1 (Arturo) - src/app/pedidos/page.tsx

- Metodo: GET
- Ruta: /api/pedidos

#### Campos de Respuesta (PedidoResumen):
Incluye campos de conteo consolidado para evitar que el Frontend haga multiples peticiones adicionales.

#### Response (200 OK):
```json
[
  {
    "id": "ped_992a33b664219901",
    "codigo": "SUB-00842",
    "cliente": {
      "id": "cm7a18b201b5e4c129c1a821f",
      "nombre": "Promocion 2002 - Colegio San Jose"
    },
    "estado": "BORRADOR",
    "totalPrendas": 28,
    "fechaPedido": "2026-09-11T14:35:00.000Z",
    "fechaCompromiso": "2026-10-15T00:00:00.000Z"
  }
]
```

---

### 2.2 Crear Cabecera de Pedido
Crea el pedido base asignado a un cliente y coordinador.

- Metodo: POST
- Ruta: /api/pedidos
- Headers: Content-Type: application/json

#### Reglas de Negocio Asociadas:
- R-A03: El codigo es legible y unico (ejemplo: SUB-00842).
- R-A09: fechaCompromiso debe ser posterior a fechaPedido.
- R-F06: observaciones es texto libre no vinculante para produccion.

#### Request Body:
```json
{
  "clienteId": "cm7a18b201b5e4c129c1a821f",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "observaciones": "Entrega prioritaria para desfile escolar"
}
```

`codigo` y las relaciones de auditoría se generan en el backend y no son
editables desde esta operación (R-A03, R-A10).

#### Response (201 Created):
```json
{
  "id": "ped_992a33b664219901",
  "codigo": "SUB-00842",
  "clienteId": "cm7a18b201b5e4c129c1a821f",
  "coordinadorId": "usr_coord_12345",
  "estado": "BORRADOR",
  "fechaPedido": "2026-09-11T14:35:00.000Z",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "observaciones": "Entrega prioritaria para desfile escolar",
  "creadoEn": "2026-09-11T14:35:00.000Z"
}
```

---

### 2.3 Consultar Detalle de Pedido
Obtiene la cabecera completa del pedido con cliente, colores (R-K05), grupos enriquecidos
con tipo de producto y configuracion base. Este endpoint desbloquea a BK2 (usa pedidoId
para crear participantes y prendas) y al Frontend (usa grupos para armar la tabla).

- Metodo: GET
- Ruta: /api/pedidos/:id (Ejemplo: /api/pedidos/ped_992a33b664219901)

#### Nota de integracion con BK2:
El campo grupos[].id (grupoId) es la llave que BK2 necesita para sus rutas:
  POST /api/grupos/:grupoId/participantes
  GET /api/grupos/:grupoId/participantes
El campo pedidoId es la llave que BK2 usa para:
  GET /api/pedidos/:pedidoId/resumen-produccion

#### Response (200 OK):
```json
{
  "id": "ped_992a33b664219901",
  "codigo": "SUB-00842",
  "estado": "BORRADOR",
  "fechaPedido": "2026-09-11T14:35:00.000Z",
  "fechaCompromiso": "2026-10-15T00:00:00.000Z",
  "observaciones": "Entrega prioritaria para desfile escolar",
  "cliente": {
    "id": "cm7a18b201b5e4c129c1a821f",
    "nombre": "Promocion 2002 - Colegio San Jose",
    "telefono": "999888777",
    "ciudad": "Lima"
  },
  "colores": [
    {
      "id": "col_rojo_01",
      "nombre": "Rojo Sublimado",
      "codigoHex": "#C0392B",
      "referenciaFisica": "Pantone 485 C"
    },
    {
      "id": "col_blanco_03",
      "nombre": "Blanco",
      "codigoHex": "#F7F4F2",
      "referenciaFisica": "Pantone 11-0601 TCX"
    }
  ],
  "grupos": [
    {
      "id": "grp_101",
      "nombre": "Titulares",
      "tipoProducto": {
        "id": "prod_conjunto_01",
        "codigo": "CONJUNTO",
        "nombre": "Conjunto deportivo",
        "componentes": {
          "camisetas": 1,
          "shorts": 1,
          "medias": 1
        }
      },
      "cantidadContratada": 28,
      "politicaNumeracion": "LIBRE",
      "observaciones": "Conjuntos completos para alumnos",
      "configuracion": [
        { "atributo": "CUELLO", "valor": "CUELLO_REDONDO" },
        { "atributo": "TELA", "valor": "WIN" },
        { "atributo": "ACABADO", "valor": "SUBLIMADO" },
        { "atributo": "CORTE", "valor": "MODERNO" }
      ]
    }
  ]
}
```

---

### 2.4 Actualizar Estado del Pedido
Modifica el ciclo de vida del pedido.

- Metodo: PATCH
- Ruta: /api/pedidos/:id/estado
- Headers: Content-Type: application/json

#### Estados Validos (estado):
BORRADOR | EN_CONFIGURACION | EN_RECOLECCION | EN_REVISION | CERRADO | EN_PRODUCCION | ENTREGADO | CANCELADO

#### Request Body:
```json
{
  "estado": "EN_CONFIGURACION"
}
```

La transición se valida contra la máquina de estados declarada. Solo se permiten
transiciones hacia adelante y cancelar desde un estado no terminal (R-A06).
`fechaCompromiso` debe ser posterior a `fechaPedido` y estar definida para salir
de `BORRADOR` (R-A09). Los pedidos cancelados son terminales (R-A10).

#### Response (200 OK):
```json
{
  "id": "ped_992a33b664219901",
  "codigo": "SUB-00842",
  "estadoAnterior": "BORRADOR",
  "estadoNuevo": "EN_CONFIGURACION",
  "actualizadoEn": "2026-09-11T14:40:00.000Z"
}
```

---

## 3. MODULO: COLORES DEL PEDIDO (/api/pedidos/:pedidoId/colores)

Los colores pertenecen al pedido (R-K05). Se registran aqui y BK2 los referencia desde las
prendas mediante colorId. No pueden existir colores sin codigo hexadecimal en formato #RRGGBB.

### 3.1 Registrar Color en un Pedido

- Metodo: POST
- Ruta: /api/pedidos/:pedidoId/colores
- Headers: Content-Type: application/json

#### Request Body:
```json
{
  "nombre": "Rojo Sublimado",
  "codigoHex": "#C0392B",
  "referenciaFisica": "Pantone 485 C"
}
```

#### Response (201 Created):
```json
{
  "id": "col_rojo_01",
  "pedidoId": "ped_992a33b664219901",
  "nombre": "Rojo Sublimado",
  "codigoHex": "#C0392B",
  "referenciaFisica": "Pantone 485 C"
}
```

---

### 3.2 Listar Colores de un Pedido

- Metodo: GET
- Ruta: /api/pedidos/:pedidoId/colores

#### Response (200 OK):
```json
[
  {
    "id": "col_rojo_01",
    "pedidoId": "ped_992a33b664219901",
    "nombre": "Rojo Sublimado",
    "codigoHex": "#C0392B",
    "referenciaFisica": "Pantone 485 C"
  },
  {
    "id": "col_blanco_03",
    "pedidoId": "ped_992a33b664219901",
    "nombre": "Blanco",
    "codigoHex": "#F7F4F2",
    "referenciaFisica": "Pantone 11-0601 TCX"
  }
]
```

### 3.3 Registrar varios colores

La misma ruta acepta un arreglo no vacío con objetos del mismo formato:

```json
[
  { "nombre": "Rojo", "codigoHex": "#C0392B" },
  { "nombre": "Blanco", "codigoHex": "#F7F4F2" }
]
```

---

## 4. MODULO: GRUPOS Y POLITICAS (/api/grupos)

### 4.1 Registrar Grupo en un Pedido
Crea una agrupacion de prendas dentro del pedido y define su politica de numeracion.
BK2 necesita el id devuelto (grupoId) para registrar participantes y prendas.

- Metodo: POST
- Ruta: /api/pedidos/:pedidoId/grupos
- Headers: Content-Type: application/json

#### Reglas de Negocio Asociadas:
- R-B02: cantidadContratada es obligatoria para contrastar con las prendas reales (lo usa BK2 en resumen-produccion).
- R-G01: politicaNumeracion acepta LIBRE (por defecto) o UNICA.

#### Request Body:
```json
{
  "nombre": "Titulares",
  "tipoProductoId": "prod_conjunto_01",
  "cantidadContratada": 28,
  "politicaNumeracion": "UNICA",
  "observaciones": "Conjuntos completos para alumnos",
  "configuracion": [
    { "atributo": "CUELLO", "valor": "CUELLO_REDONDO" },
    { "atributo": "TELA", "valor": "WIN" },
    { "atributo": "ACABADO", "valor": "SUBLIMADO" },
    { "atributo": "CORTE", "valor": "MODERNO" }
  ]
}
```

#### Response (201 Created):
```json
{
  "id": "grp_101",
  "pedidoId": "ped_992a33b664219901",
  "nombre": "Titulares",
  "tipoProducto": {
    "id": "prod_conjunto_01",
    "codigo": "CONJUNTO",
    "nombre": "Conjunto deportivo",
    "componentes": {
      "camisetas": 1,
      "shorts": 1,
      "medias": 1
    }
  },
  "cantidadContratada": 28,
  "politicaNumeracion": "UNICA",
  "observaciones": "Conjuntos completos para alumnos",
  "configuracion": [
    { "atributo": "CUELLO", "valor": "CUELLO_REDONDO" },
    { "atributo": "TELA", "valor": "WIN" },
    { "atributo": "ACABADO", "valor": "SUBLIMADO" },
    { "atributo": "CORTE", "valor": "MODERNO" }
  ]
}
```

---

### 4.2 Listar Grupos de un Pedido
Usado por el Frontend para construir el selector de pestanas de grupos.

- Metodo: GET
- Ruta: /api/pedidos/:pedidoId/grupos

#### Response (200 OK):
```json
[
  {
    "id": "grp_101",
    "nombre": "Titulares",
    "tipoProducto": {
      "id": "prod_conjunto_01",
      "codigo": "CONJUNTO",
      "nombre": "Conjunto deportivo",
      "componentes": {
        "camisetas": 1,
        "shorts": 1,
        "medias": 1
      }
    },
    "cantidadContratada": 28,
    "politicaNumeracion": "UNICA",
    "configuracion": [
      { "atributo": "CUELLO", "valor": "CUELLO_REDONDO" },
      { "atributo": "TELA", "valor": "WIN" },
      { "atributo": "ACABADO", "valor": "SUBLIMADO" },
      { "atributo": "CORTE", "valor": "MODERNO" }
    ]
  }
]
```

---

### 4.3 Cambiar Politica de Numeracion de un Grupo
Modifica si los dorsales se pueden repetir (LIBRE) o deben ser estrictamente unicos (UNICA).

- Metodo: PATCH
- Ruta: /api/grupos/:id/politica
- Headers: Content-Type: application/json

#### Efecto en Base de Datos:
Un trigger nativo en PostgreSQL propaga automaticamente el cambio a todas las prendas existentes en el grupo.

#### Request Body:
```json
{
  "politicaNumeracion": "LIBRE"
}
```

#### Response (200 OK):
```json
{
  "id": "grp_101",
  "nombre": "Titulares",
  "politicaNumeracion": "LIBRE",
  "mensaje": "Politica actualizada y propagada a las prendas del grupo."
}
```

---

## 5. CATALOGO DE TIPOS DE PRODUCTO (/api/tipos-producto)

BK2 necesita los tipos de producto para asociarlos a las prendas. BK1 es el dueno de este catalogo.

### 5.1 Listar Tipos de Producto

- Metodo: GET
- Ruta: /api/tipos-producto

#### Response (200 OK):
```json
[
  {
    "id": "prod_conjunto_01",
    "codigo": "CONJUNTO",
    "nombre": "Conjunto deportivo",
    "componentes": {
      "camisetas": 1,
      "shorts": 1,
      "medias": 1
    }
  },
  {
    "id": "prod_cam_01",
    "codigo": "CAMISETA",
    "nombre": "Camiseta sola",
    "componentes": {
      "camisetas": 1,
      "shorts": 0,
      "medias": 0
    }
  },
  {
    "id": "prod_short_01",
    "codigo": "SHORT",
    "nombre": "Short solo",
    "componentes": {
      "camisetas": 0,
      "shorts": 1,
      "medias": 0
    }
  }
]
```

## 5.2 Resumen de producción

- Método: GET o POST
- Ruta: `/api/pedidos/:id/resumen-produccion`

La respuesta calcula las prendas registradas y las piezas físicas por grupo y
pedido. Compara las prendas contra `cantidadContratada` y multiplica el BOM
de cada `TipoProducto`; ningún total se recibe escrito manualmente.

La respuesta debe permitir a BK2 y al Frontend distinguir
`totalPrendas`, `cantidadContratada`, `prendasRegistradas`,
`prendasFaltantes`, `prendasSobrantes`, `piezasContratadas` y
`piezasRegistradas`. Los importes no forman parte de este resumen; se calculan
con tarifas en la confirmación comercial correspondiente.

## 5.3 Detalle y eliminación de grupo

- Método: GET — `/api/grupos/:id`
- Método: DELETE — `/api/grupos/:id`

La eliminación solo procede si el grupo no tiene participantes ni prendas.

---

## 6. Tabla Resumen de Endpoints - BK1

| # | Modulo | Metodo | Ruta | Descripcion |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Clientes | GET | /api/clientes | Listar clientes para selector del Frontend |
| 2 | Clientes | POST | /api/clientes | Registrar nuevo cliente |
| 3 | Pedidos | GET | /api/pedidos | Listar pedidos resumidos (pantalla principal) |
| 4 | Pedidos | POST | /api/pedidos | Crear cabecera de pedido |
| 5 | Pedidos | GET | /api/pedidos/:id | Detalle completo con colores, grupos y configuracion |
| 6 | Pedidos | PATCH | /api/pedidos/:id/estado | Actualizar estado del ciclo de vida |
| 7 | Colores | POST | /api/pedidos/:pedidoId/colores | Registrar color con hex (prerequisito para BK2) |
| 8 | Colores | GET | /api/pedidos/:pedidoId/colores | Listar colores del pedido |
| 9 | Grupos | POST | /api/pedidos/:pedidoId/grupos | Crear grupo (genera grupoId para BK2) |
| 10 | Grupos | GET | /api/pedidos/:pedidoId/grupos | Listar grupos del pedido con configuracion |
| 11 | Grupos | PATCH | /api/grupos/:id/politica | Cambiar politica LIBRE o UNICA |
| 12 | Catalogo | GET | /api/tipos-producto | Listar tipos de producto con componentes fisicos |
| 13 | Pedidos | GET/POST | /api/pedidos/:id/resumen-produccion | Calcular resumen de producción |
| 14 | Grupos | GET | /api/grupos/:id | Obtener detalle individual |
| 15 | Grupos | DELETE | /api/grupos/:id | Eliminar grupo sin dependencias |

---

## 7. Codigos de Error Globales del Backend

| Codigo HTTP | Motivo | Ejemplo de Causa |
| :--- | :--- | :--- |
| 400 Bad Request | Fallo de validacion en DTO | Falta campo obligatorio o formato invalido |
| 404 Not Found | Recurso no encontrado | El codigo de pedido o id no existe en la base de datos |
| 409 Conflict | Violacion de regla de unicidad | Codigo de pedido duplicado (SUB-00842 ya registrado) |
| 422 Unprocessable | Violacion de regla de negocio | fechaCompromiso anterior a fechaPedido (R-A09) |
| 422 Unprocessable | Violacion de regla de color | codigoHex sin formato #RRGGBB o color sin hex al aprobar diseno |
