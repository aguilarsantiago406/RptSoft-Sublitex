# SIPES — Contrato de API: Módulo Participantes y Prendas (Sprint 1)

**Frente:** Backend 2 (BK2)  
**Versión:** 2.1.0 (Auditoría Técnica Consolidada — Rutas sin prefijo /v1)  
**Objetivo:** Especificación técnica completa de JSONs para la configuración del simulador/mock server del Frontend.

---

## 1. Flujo Público del Participante (Vía Enlace WhatsApp sin Contraseña - R-D05)

### `GET /api/participantes/enlace/:token`
**Descripción:** Carga inicial de la pantalla del participante desde su celular. Devuelve sus datos, sus prendas y los catálogos contextuales disponibles (tallas permitidas para su producto y ubicaciones de estampado) sin requerir login ni JWT.  
**Request Body:** Ninguno  
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

---

### `PUT /api/participantes/enlace/:token/ficha`
**Descripción:** Guarda la ficha mínima del participante (talla, número, nombre en prenda, género y personalizaciones) mediante su token personal. Cambia automáticamente el estado a `REGISTRADO` (R-D03) y sella `registradoEn`.  
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

## 2. Gestión Administrativa de Participantes (Panel Coordinador)

### `POST /api/grupos/:grupoId/participantes`
**Descripción:** Registra un participante dentro de un grupo y genera su enlace personal sin contraseña (R-D05).  
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
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
[
  {
    "id": "part_1001",
    "grupoId": "grp_PROMO2002",
    "nombrePersona": "Carlos Mendoza",
    "estado": "CONFIRMADO",
    "enlaceToken": "tok_carlos_mendoza_8492",
    "enlaceExpiraEn": "2026-09-17T23:59:59Z",
    "enlaceRevocado": false,
    "registradoEn": "2026-09-08T15:30:00Z",
    "confirmadoEn": "2026-09-08T18:00:00Z",
    "prendas": [
      {
        "id": "pre_2001",
        "participanteId": "part_1001",
        "grupoId": "grp_PROMO2002",
        "tipoProductoId": "prod_cam_short_01",
        "tallaId": "talla_M",
        "numero": "69",
        "genero": "HOMBRE",
        "tipoPrenda": "VENTA",
        "colorId": "col_rojo_01",
        "nombreEnPrenda": "MENDOZA",
        "esArquero": false,
        "precioCalculado": 55.00,
        "personalizaciones": [
          {
            "id": "pers_4001",
            "ubicacionId": "ubic_espalda_alta",
            "contenido": "MENDOZA"
          }
        ],
        "excepciones": [
          {
            "id": "exc_3001",
            "atributoId": "attr_cuello",
            "valorAtributoId": "val_cuello_v",
            "motivo": "Preferencia personal por comodidad"
          }
        ]
      },
      {
        "id": "pre_2002",
        "participanteId": "part_1001",
        "grupoId": "grp_PROMO2002",
        "tipoProductoId": "prod_short_01",
        "tallaId": "talla_S",
        "numero": "S/N",
        "genero": "HOMBRE",
        "tipoPrenda": "OBSEQUIO",
        "colorId": "col_azul_02",
        "nombreEnPrenda": "MENDOZA",
        "esArquero": false,
        "precioCalculado": 0.00,
        "personalizaciones": [],
        "excepciones": []
      }
    ]
  }
]
```

---

### `GET /api/participantes/:id`
**Descripción:** Obtiene el detalle completo de un participante por su ID.  
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "grupoId": "grp_PROMO2002",
  "nombrePersona": "Carlos Mendoza",
  "estado": "CONFIRMADO",
  "enlaceToken": "tok_carlos_mendoza_8492",
  "enlaceExpiraEn": "2026-09-17T23:59:59Z",
  "enlaceRevocado": false,
  "registradoEn": "2026-09-08T15:30:00Z",
  "confirmadoEn": "2026-09-08T18:00:00Z",
  "prendas": [
    {
      "id": "pre_2001",
      "participanteId": "part_1001",
      "grupoId": "grp_PROMO2002",
      "tipoProductoId": "prod_cam_short_01",
      "tallaId": "talla_M",
      "numero": "69",
      "genero": "HOMBRE",
      "tipoPrenda": "VENTA",
      "colorId": "col_rojo_01",
      "nombreEnPrenda": "MENDOZA",
      "esArquero": false,
      "precioCalculado": 55.00,
      "personalizaciones": [],
      "excepciones": []
    }
  ]
}
```

---

### `POST /api/participantes/:id/confirmar`
**Descripción:** Permite al coordinador dar por confirmado manualmente a un participante.  
**Request Body:** Ninguno  
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
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "enlaceRevocado": true
}
```

---

### `POST /api/participantes/:id/regenerar-enlace`
**Descripción:** Genera un nuevo token único de enlace, reactiva el acceso y renueva la expiración a 7 días (R-D06).  
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
{
  "id": "part_1001",
  "enlaceToken": "tok_carlos_mendoza_new_9941",
  "enlaceExpiraEn": "2026-09-17T23:59:59Z",
  "enlaceRevocado": false
}
```

---

## 3. Prendas (Unidad Contable Principal)

### `POST /api/prendas`
**Descripción:** Registra una prenda asociada a un participante. El precio se deriva en el servidor mediante la tarifa vigente (R-K10). Admite "S/N" en número (R-K04).  
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
**Descripción:** Actualización administrativa de la Ficha Mínima de la prenda (R-E03) por el coordinador.  
**Request Body:**
```json
{
  "tallaId": "talla_M",
  "numero": "10",
  "genero": "HOMBRE",
  "nombreEnPrenda": "MENDOZA JR"
}
```
**Response Body (200 OK):**
```json
{
  "id": "pre_2001",
  "participanteId": "part_1001",
  "grupoId": "grp_PROMO2002",
  "tipoProductoId": "prod_cam_short_01",
  "tallaId": "talla_M",
  "numero": "10",
  "genero": "HOMBRE",
  "tipoPrenda": "VENTA",
  "colorId": "col_rojo_01",
  "nombreEnPrenda": "MENDOZA JR",
  "esArquero": false,
  "precioCalculado": 55.00
}
```

---

### `DELETE /api/prendas/:id`
**Descripción:** Elimina una prenda de la lista.  
**Request Body:** Ninguno  
**Response Body (204 No Content):**
```json
{}
```

---

## 4. Excepciones de Prenda (Deltas)

### `POST /api/excepciones-prenda`
**Descripción:** Registra una excepción sobre un atributo base del grupo (R-C01/R-C02). Guarda únicamente el delta (atributoId, valorAtributoId). Si el valor coincide con el valor general del grupo, rechaza con error R-C05.  
**Request Body:**
```json
{
  "prendaId": "pre_2001",
  "atributoId": "attr_cuello",
  "valorAtributoId": "val_cuello_v",
  "motivo": "Preferencia personal por comodidad"
}
```
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
**Descripción:** Elimina la excepción por su ID propio. La prenda vuelve a heredar automáticamente la configuración estándar del grupo (R-C01).  
**Request Body:** Ninguno  
**Response Body (204 No Content):**
```json
{}
```

---

## 5. Personalizaciones (Estampados con Ubicación)

### `POST /api/personalizaciones`
**Descripción:** Agrega un estampado en una ubicación declarada y cerrada de la prenda (R-F01/R-F03).  
**Request Body:**
```json
{
  "prendaId": "pre_2001",
  "ubicacionId": "ubic_espalda_alta",
  "contenido": "MENDOZA"
}
```
**Response Body (201 Created):**
```json
{
  "id": "pers_4001",
  "prendaId": "pre_2001",
  "ubicacionId": "ubic_espalda_alta",
  "contenido": "MENDOZA"
}
```

---

### `DELETE /api/personalizaciones/:id`
**Descripción:** Elimina una personalización por su ID.  
**Request Body:** Ninguno  
**Response Body (204 No Content):**
```json
{}
```

---

## 6. Resumen de Producción (Conteo de Piezas Físicas)

### `GET /api/pedidos/:pedidoId/resumen-produccion`
**Descripción:** Conteo consolidado de producción por piezas físicas reales (R-K03). Multiplica las prendas por los componentes del TipoProducto (camisetas, shorts, medias) y calcula los importes según el tipo de prenda (R-K02).  
**Request Body:** Ninguno  
**Response Body (200 OK):**
```json
{
  "pedidoId": "ped_promo_2002",
  "totalPrendas": 3,
  "desgloseTiposPrenda": {
    "venta": 1,
    "obsequio": 1,
    "muestra": 1
  },
  "piezasFisicas": {
    "totalCamisetas": 2,
    "totalShorts": 2,
    "totalMedias": 0
  },
  "importeTotalEstimado": 55.00
}
```

---

## 7. Mock Maestro del Pedido PROMO 2002

Objeto consolidado para copiar y pegar directamente en el archivo `db.json` del servidor simulador (`json-server`).

```json
{
  "participantes": [
    {
      "id": "part_1001",
      "grupoId": "grp_PROMO2002",
      "nombrePersona": "Carlos Mendoza",
      "estado": "CONFIRMADO",
      "enlaceToken": "tok_carlos_mendoza_8492",
      "enlaceExpiraEn": "2026-09-17T23:59:59Z",
      "enlaceRevocado": false,
      "registradoEn": "2026-09-08T15:30:00Z",
      "confirmadoEn": "2026-09-08T18:00:00Z"
    },
    {
      "id": "part_1002",
      "grupoId": "grp_PROMO2002",
      "nombrePersona": "Ana Suárez",
      "estado": "REGISTRADO",
      "enlaceToken": "tok_ana_suarez_1194",
      "enlaceExpiraEn": "2026-09-17T23:59:59Z",
      "enlaceRevocado": false,
      "registradoEn": "2026-09-10T21:00:00Z",
      "confirmadoEn": null
    }
  ],
  "prendas": [
    {
      "id": "pre_2001",
      "participanteId": "part_1001",
      "grupoId": "grp_PROMO2002",
      "tipoProductoId": "prod_cam_short_01",
      "tallaId": "talla_M",
      "numero": "69",
      "genero": "HOMBRE",
      "tipoPrenda": "VENTA",
      "colorId": "col_rojo_01",
      "nombreEnPrenda": "MENDOZA",
      "esArquero": false,
      "precioCalculado": 55.00
    },
    {
      "id": "pre_2002",
      "participanteId": "part_1001",
      "grupoId": "grp_PROMO2002",
      "tipoProductoId": "prod_short_01",
      "tallaId": "talla_S",
      "numero": "S/N",
      "genero": "HOMBRE",
      "tipoPrenda": "OBSEQUIO",
      "colorId": "col_azul_02",
      "nombreEnPrenda": "MENDOZA",
      "esArquero": false,
      "precioCalculado": 0.00
    },
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
  ],
  "excepcionesPrenda": [
    {
      "id": "exc_3001",
      "prendaId": "pre_2001",
      "atributoId": "attr_cuello",
      "valorAtributoId": "val_cuello_v",
      "motivo": "Preferencia personal por comodidad"
    }
  ],
  "personalizaciones": [
    {
      "id": "pers_4001",
      "prendaId": "pre_2001",
      "ubicacionId": "ubic_espalda_alta",
      "contenido": "MENDOZA"
    }
  ],
  "resumenProduccion": {
    "pedidoId": "ped_promo_2002",
    "totalPrendas": 3,
    "desgloseTiposPrenda": {
      "venta": 1,
      "obsequio": 1,
      "muestra": 1
    },
    "piezasFisicas": {
      "totalCamisetas": 2,
      "totalShorts": 2,
      "totalMedias": 0
    },
    "importeTotalEstimado": 55.00
  }
}
```

---

## 8. Catálogo Resumen de Endpoints (Frente BK2)

A continuación se lista la totalidad de los 12 endpoints que componen el frente de Backend 2 para referencia rápida del equipo de desarrollo:

| # | Módulo | Método | Ruta HTTP | Descripción | Ámbito / Rol |
|---|---|---|---|---|---|
| **1** | Participantes (Enlace) | `GET` | `/api/participantes/enlace/:token` | Carga ficha del participante con catálogos contextuales | Público (Sin JWT) |
| **2** | Participantes (Enlace) | `PUT` | `/api/participantes/enlace/:token/ficha` | Guarda ficha mínima, pasa a `REGISTRADO` | Público (Sin JWT) |
| **3** | Participantes (Enlace) | `POST` | `/api/participantes/enlace/:token/confirmar` | Visto bueno final del participante, pasa a `CONFIRMADO` | Público (Sin JWT) |
| **4** | Participantes (Admin) | `POST` | `/api/grupos/:grupoId/participantes` | Crea participante en grupo y genera token de enlace | Coordinador / Venta |
| **5** | Participantes (Admin) | `GET` | `/api/grupos/:grupoId/participantes` | Lista participantes del grupo con prendas completas | Coordinador / Venta |
| **6** | Participantes (Admin) | `GET` | `/api/participantes/:id` | Detalle individual de un participante | Coordinador / Venta |
| **7** | Participantes (Admin) | `POST` | `/api/participantes/:id/confirmar` | Confirmación manual administrativa de un participante | Coordinador / Venta |
| **8** | Participantes (Admin) | `POST` | `/api/participantes/:id/revocar-enlace` | Revoca de inmediato el acceso por enlace | Coordinador / Venta |
| **9** | Participantes (Admin) | `POST` | `/api/participantes/:id/regenerar-enlace` | Genera nuevo token y renueva vigencia por 7 días | Coordinador / Venta |
| **10** | Prendas | `POST` | `/api/prendas` | Crea prenda (venta/obsequio/muestra) para un participante | Coordinador / Participante |
| **11** | Prendas | `PATCH` | `/api/prendas/:id` | Actualiza ficha mínima (talla, número, género, apodo) | Coordinador / Participante |
| **12** | Prendas | `DELETE` | `/api/prendas/:id` | Elimina una prenda del pedido | Coordinador |
| **13** | Excepciones Prenda | `POST` | `/api/excepciones-prenda` | Registra delta de configuración sobre prenda (R-C01) | Coordinador |
| **14** | Excepciones Prenda | `DELETE` | `/api/excepciones-prenda/:id` | Elimina delta y devuelve prenda al valor del grupo | Coordinador |
| **15** | Personalizaciones | `POST` | `/api/personalizaciones` | Registra estampado con ubicación declarada (R-F01) | Coordinador / Participante |
| **16** | Personalizaciones | `DELETE` | `/api/personalizaciones/:id` | Elimina estampado de una prenda | Coordinador / Participante |
| **17** | Resumen Producción | `GET` | `/api/pedidos/:pedidoId/resumen-produccion` | Consolidado contable de piezas físicas (R-K03) | Producción / Coordinador |
