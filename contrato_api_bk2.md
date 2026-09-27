# 📋 SIPES — Contrato Oficial de API: Operación, Diseño y Producción (BK2 y BK3)

**Proyecto:** SIPES (*Sistema de Información y Pedidos para la Empresa Sublitex*)  
**Frentes:** Backend 2 (BK2 — Operación Prendas) y Backend 3 (BK3 — Diseño, Taller y Auditoría)  
**Versión:** 3.0.0 (Unificación Operativa BK2 + BK3)  
**Host base:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api/docs`  
**Fecha de corte:** 24 de Septiembre de 2026  
**Referencias Oficiales:** `docs_bk2/reglas_generales.md` y `Backend/prisma/schema.prisma`  

---

## 📑 Índice General

* [PARTE I: FRENTE BK2 — OPERACIÓN DE PRENDAS](#parte-i-frente-bk2--operación-de-prendas)
  * [1. Flujo Público del Participante (WhatsApp - Sin JWT)](#1-flujo-público-del-participante-whatsapp---sin-jwt)
  * [2. Gestión Administrativa de Participantes (Con JWT)](#2-gestión-administrativa-de-participantes-con-jwt)
  * [3. Fichas Mínimas de Prendas y Conteo de Piezas (Con JWT)](#3-fichas-mínimas-de-prendas-y-conteo-de-piezas-con-jwt)
  * [4. Excepciones de Prenda — Arquitectura Delta (Con JWT)](#4-excepciones-de-prenda--arquitectura-delta-con-jwt)
  * [5. Personalizaciones y Estampados (Con JWT)](#5-personalizaciones-y-estampados-con-jwt)
* [PARTE II: FRENTE BK3 — DISEÑO, PRODUCCIÓN Y AUDITORÍA](#parte-ii-frente-bk3--diseño-producción-y-auditoría)
  * [6. Módulo de Diseño Gráfico y Versionado](#6-módulo-de-diseño-gráfico-y-versionado)
  * [7. Módulo de Taller, Nesting, Archivos TIF y Acuse de Recibo](#7-módulo-de-taller-nesting-y-archivos-tif)
  * [8. Módulo de Auditoría e Inmutabilidad (Append-Only)](#8-módulo-de-auditoría-e-inmutabilidad-append-only)
  * [9. Módulo de Almacenamiento Físico de Archivos (Supabase Storage)](#9-módulo-de-almacenamiento-físico-de-archivos-supabase-storage)
* [PARTE III: MATRIZ RESUMEN DE ENDPOINTS (BK2 + BK3 + STORAGE)](#parte-iii-matriz-resumen-de-endpoints-bk2--bk3--storage)

---

# PARTE I: FRENTE BK2 — OPERACIÓN DE PRENDAS

---

## 1. Flujo Público del Participante (WhatsApp - Sin JWT)

Acceso móvil optimizado para el alumno o padre de familia que recibe su link vía WhatsApp. No requiere usuario ni contraseña; su seguridad reside en un `enlaceToken` criptográfico único, revocable y temporal (**R-D05**, **R-D06**, **R-J05**).

### `GET /api/participantes/enlace/:token`
* **Descripción:** Carga inicial de la ficha del participante y sus prendas desde el móvil.
* **Seguridad:** Pública (Token en URL).
* **Response (200 OK):**
```json
{
  "participante": {
    "id": "part_cm7a1002",
    "nombrePersona": "Ana Suárez",
    "estado": "PENDIENTE",
    "enlaceRevocado": false,
    "enlaceExpiraEn": "2026-10-01T23:59:59.000Z",
    "registradoEn": null,
    "confirmadoEn": null
  },
  "grupo": {
    "id": "grp_cm7a2001",
    "nombre": "Conjuntos blancos",
    "politicaNumeracion": "LIBRE"
  },
  "prendas": [
    {
      "id": "pre_cm7a3001",
      "tipoProductoId": "prod_cam_01",
      "tallaId": null,
      "numero": null,
      "genero": "MUJER",
      "nombreEnPrenda": null,
      "colorId": "col_cm7a4001",
      "esArquero": false,
      "personalizaciones": [],
      "excepciones": []
    }
  ],
  "catalogos": {
    "tallasDisponibles": [
      { "id": "val_talla_s", "codigo": "S", "etiqueta": "Talla S" },
      { "id": "val_talla_m", "codigo": "M", "etiqueta": "Talla M" },
      { "id": "val_talla_l", "codigo": "L", "etiqueta": "Talla L" }
    ],
    "ubicacionesPersonalizacion": [
      { "id": "ubic_espalda", "codigo": "ESPALDA", "etiqueta": "Espalda" }
    ]
  }
}
```
* **Errores:** `404 Not Found` (token inexistente), `410 Gone` (enlace revocado o expirado).

---

### `PUT /api/participantes/enlace/:token/ficha`
* **Descripción:** Guarda la ficha mínima del participante (talla, número, corte, apodo). Cambia el estado a `REGISTRADO` (**R-D03**) y sella `registradoEn`.
* **Seguridad:** Pública (Token en URL).
* **Request Body:**
```json
{
  "prendas": [
    {
      "prendaId": "pre_cm7a3001",
      "tallaId": "val_talla_m",
      "numero": "10",
      "genero": "MUJER",
      "nombreEnPrenda": "ANA",
      "colorId": "col_cm7a4001",
      "personalizaciones": [
        {
          "ubicacionId": "ubic_espalda",
          "contenido": "ANA"
        }
      ]
    }
  ]
}
```
* **Response (200 OK):**
```json
{
  "id": "part_cm7a1002",
  "nombrePersona": "Ana Suárez",
  "estado": "REGISTRADO",
  "registradoEn": "2026-09-24T14:30:00.000Z",
  "confirmadoEn": null
}
```

---

### `POST /api/participantes/enlace/:token/confirmar`
* **Descripción:** Confirmación definitiva por el alumno/padre (**R-D03**). Pasa a `CONFIRMADO`, sella `confirmadoEn` e invalida futuras ediciones.
* **Seguridad:** Pública (Token en URL).
* **Response (200 OK):**
```json
{
  "id": "part_cm7a1002",
  "nombrePersona": "Ana Suárez",
  "estado": "CONFIRMADO",
  "confirmadoEn": "2026-09-24T14:35:00.000Z"
}
```

---

## 2. Gestión Administrativa de Participantes (Con JWT)

Operaciones del Coordinador o Vendedora dentro del sistema.

### `POST /api/grupos/:grupoId/participantes`
* **Descripción:** Registra un participante en el grupo y genera su token de WhatsApp.
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "nombrePersona": "Carlos Mendoza"
}
```
* **Response (201 Created):**
```json
{
  "id": "part_cm7a1003",
  "grupoId": "grp_cm7a2001",
  "nombrePersona": "Carlos Mendoza",
  "estado": "PENDIENTE",
  "enlaceToken": "8f3b2e1a9c4d5e6f7a8b9c0d1e2f3a4b",
  "enlaceExpiraEn": "2026-10-01T23:59:59.000Z",
  "enlaceRevocado": false
}
```

---

### `GET /api/grupos/:grupoId/participantes`
* **Descripción:** Lista los participantes del grupo con prendas, personalizaciones y estado.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
[
  {
    "id": "part_cm7a1003",
    "grupoId": "grp_cm7a2001",
    "nombrePersona": "Carlos Mendoza",
    "estado": "PENDIENTE",
    "enlaceToken": "8f3b2e1a9c4d5e6f7a8b9c0d1e2f3a4b",
    "enlaceRevocado": false,
    "enlaceExpiraEn": "2026-10-01T23:59:59.000Z",
    "registradoEn": null,
    "confirmadoEn": null,
    "prendas": [
      {
        "id": "pre_cm7a3001",
        "tipoProductoId": "prod_cam_01",
        "tallaId": "val_talla_m",
        "numero": "10",
        "genero": "HOMBRE",
        "nombreEnPrenda": "CARLOS",
        "colorId": "col_cm7a4001",
        "esArquero": false,
        "tipoPrenda": "VENTA",
        "personalizaciones": [
          {
            "id": "pers_cm7a5001",
            "ubicacionId": "ubic_espalda",
            "contenido": "CARLOS",
            "ubicacion": { "id": "ubic_espalda", "codigo": "ESPALDA", "nombre": "Espalda" }
          }
        ],
        "excepciones": []
      }
    ]
  }
]
```

---

### `GET /api/grupos/:grupoId/enlaces-whatsapp`
* **Descripción:** Compila todos los enlaces personales de WhatsApp para el grupo y genera el mensaje formateado listo para que el coordinador externo lo comparta en su grupo de WhatsApp (**R-D05**, **R-D06**, **R-I04**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Query Params:** `?soloPendientes=true` (opcional, para recordatorios a quienes faltan registrar su ficha).
* **Response (200 OK):**
```json
{
  "pedidoId": "ped_cm7a0001",
  "pedidoCodigo": "SUB-000842",
  "grupoId": "grp_cm7a0002",
  "grupoNombre": "Polos Alumnos",
  "total": 28,
  "soloPendientes": false,
  "mensajeGrupal": "📢 *Registro de Tallas y Nombres — SUB-000842 (Polos Alumnos)*\nPor favor, cada participante ingrese a su enlace personal para llenar su ficha:\n\n👉 *Ana Li*: https://app.sublitex.com/ficha/tok_anali123\n👉 *Carlos Chapoñán*: https://app.sublitex.com/ficha/tok_chapo456\n\n⚠️ _Los enlaces son personales e intransferibles._",
  "participantes": [
    {
      "id": "part_1",
      "nombrePersona": "Ana Li",
      "estado": "PENDIENTE",
      "enlaceToken": "tok_anali123",
      "url": "https://app.sublitex.com/ficha/tok_anali123",
      "expirado": false,
      "enlaceRevocado": false,
      "valido": true
    }
  ]
}
```

---

### `GET /api/participantes/:id`
* **Descripción:** Detalle individual del participante.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "id": "part_cm7a1003",
  "grupoId": "grp_cm7a2001",
  "nombrePersona": "Carlos Mendoza",
  "estado": "REGISTRADO",
  "enlaceToken": "8f3b2e1a9c4d5e6f7a8b9c0d1e2f3a4b",
  "enlaceRevocado": false,
  "enlaceExpiraEn": "2026-10-01T23:59:59.000Z",
  "registradoEn": "2026-09-24T14:30:00.000Z",
  "confirmadoEn": null,
  "prendas": [
    {
      "id": "pre_cm7a3001",
      "tipoProductoId": "prod_cam_01",
      "tallaId": "val_talla_m",
      "numero": "10",
      "genero": "HOMBRE",
      "nombreEnPrenda": "CARLOS",
      "colorId": "col_cm7a4001",
      "esArquero": false,
      "tipoPrenda": "VENTA",
      "personalizaciones": [],
      "excepciones": []
    }
  ]
}
```

---

### `POST /api/participantes/:id/confirmar`
* **Descripción:** Confirmación manual ejecutada por el coordinador.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "id": "part_cm7a1003",
  "grupoId": "grp_cm7a2001",
  "nombrePersona": "Carlos Mendoza",
  "estado": "CONFIRMADO",
  "enlaceToken": "8f3b2e1a9c4d5e6f7a8b9c0d1e2f3a4b",
  "enlaceRevocado": false,
  "enlaceExpiraEn": "2026-10-01T23:59:59.000Z",
  "registradoEn": "2026-09-24T14:30:00.000Z",
  "confirmadoEn": "2026-09-24T14:40:00.000Z"
}
```

---

### `POST /api/participantes/:id/revocar-enlace`
* **Descripción:** Revoca de inmediato el enlace de WhatsApp (**R-D06**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "id": "part_cm7a1003", "enlaceRevocado": true }`

---

### `POST /api/participantes/:id/regenerar-enlace`
* **Descripción:** Genera un nuevo token válido por 7 días (**R-D05**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "id": "part_cm7a1003", "enlaceToken": "nuevo_token_hex...", "enlaceRevocado": false }`

---

### `DELETE /api/participantes/:id`
* **Descripción:** Elimina al participante si el bloque `LISTA` está `ABIERTO` (**R-D07**, **R-H03**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "mensaje": "Participante eliminado correctamente" }`
* **Errores:** `400 Bad Request` si el bloque `LISTA` está cerrado.

---

## 3. Fichas Mínimas de Prendas y Conteo de Piezas (Con JWT)

### `POST /api/prendas`
* **Descripción:** Crea una prenda para un participante (**R-E01**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "participanteId": "part_cm7a1003",
  "tipoProductoId": "prod_cam_01",
  "tipoPrenda": "VENTA",
  "tallaId": "val_talla_l",
  "numero": "7",
  "genero": "HOMBRE",
  "colorId": "col_cm7a4001",
  "nombreEnPrenda": "MENDOZA",
  "esArquero": false
}
```
* **Response (201 Created):**
```json
{
  "id": "pre_cm7a3002",
  "participanteId": "part_cm7a1003",
  "grupoId": "grp_cm7a2001",
  "tipoProductoId": "prod_cam_01",
  "tallaId": "val_talla_l",
  "numero": "7",
  "genero": "HOMBRE",
  "tipoPrenda": "VENTA",
  "colorId": "col_cm7a4001",
  "nombreEnPrenda": "MENDOZA",
  "esArquero": false,
  "politicaNumeracion": "LIBRE",
  "precioCalculado": 45.00
}
```
* **Errores:** `400 Bad Request` si `colorId` no pertenece a la paleta del pedido (**R-K05**).

---

### `PATCH /api/prendas/:id`
* **Descripción:** Actualiza la ficha mínima de la prenda. Valida paleta de color (**R-K05**) y bloque `LISTA` abierto (**R-H03**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "tallaId": "val_talla_xl",
  "numero": "7",
  "nombreEnPrenda": "C. MENDOZA",
  "genero": "HOMBRE",
  "colorId": "col_cm7a4001"
}
```
* **Response (200 OK):**
```json
{
  "id": "pre_cm7a3002",
  "participanteId": "part_cm7a1003",
  "grupoId": "grp_cm7a2001",
  "tipoProductoId": "prod_cam_01",
  "tallaId": "val_talla_xl",
  "numero": "7",
  "genero": "HOMBRE",
  "tipoPrenda": "VENTA",
  "colorId": "col_cm7a4001",
  "nombreEnPrenda": "C. MENDOZA",
  "esArquero": false,
  "actualizadoEn": "2026-09-24T15:10:00.000Z"
}
```

---

### `DELETE /api/prendas/:id`
* **Descripción:** Elimina una prenda del pedido si el bloque `LISTA` está abierto (**R-H03**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "mensaje": "Prenda eliminada" }`

---

### `GET /api/pedidos/:pedidoId/resumen-produccion`
* **Descripción:** Resumen de producción multiplicando por **piezas físicas reales** (camisetas, shorts, medias), no solo prendas (**R-K03**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "pedidoId": "ped_cm7a0001",
  "totalPrendas": 28,
  "desgloseTiposPrenda": {
    "VENTA": 26,
    "OBSEQUIO": 1,
    "MUESTRA": 1
  },
  "piezasFisicas": {
    "totalCamisetas": 28,
    "totalShorts": 28,
    "totalMedias": 0
  },
  "conteoPorTalla": [
    { "talla": "S", "cantidad": 6 },
    { "talla": "M", "cantidad": 14 },
    { "talla": "L", "cantidad": 8 }
  ]
}
```

---

### `GET /api/pedidos/:pedidoId/diagnostico-cierre-lista`
* **Descripción:** Diagnóstico preventivo previo al cierre del bloque `LISTA` (**R-H09**, **R-I06..R-I09**). Calcula en tiempo real las alertas bloqueantes e informativas sin intentar alterar el estado del pedido.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "pedidoId": "ped_cm7a0001",
  "pedidoCodigo": "SUB-000842",
  "aptoParaCierre": false,
  "resumen": {
    "totalGrupos": 2,
    "cantidadContratadaTotal": 28,
    "totalPrendas": 28,
    "prendasCompletas": 26,
    "prendasIncompletas": 2,
    "totalParticipantes": 28,
    "participantesCompletos": 26,
    "participantesIncompletos": 2,
    "participantesPendientes": 1,
    "totalAlertasBloqueantes": 2,
    "totalAlertasInformativas": 2
  },
  "alertasBloqueantes": [
    {
      "tipo": "BLOQUEANTE",
      "codigo": "PRENDA_SIN_TALLA",
      "mensaje": "La prenda de \"Carlos Tapia\" está incompleta (falta talla).",
      "grupoId": "grp_1",
      "grupoNombre": "Alumnos",
      "participanteId": "part_1",
      "participanteNombre": "Carlos Tapia",
      "prendaId": "pre_1"
    }
  ],
  "alertasInformativas": [
    {
      "tipo": "INFORMATIVA",
      "codigo": "PARTICIPANTE_PENDIENTE",
      "mensaje": "El participante \"Juan Pérez\" aún no ha registrado sus datos en el portal móvil.",
      "grupoId": "grp_1",
      "grupoNombre": "Alumnos",
      "participanteId": "part_2",
      "participanteNombre": "Juan Pérez"
    }
  ]
}
```

---

## 4. Excepciones de Prenda — Arquitectura Delta (Con JWT)

Modificaciones individuales sobre atributos que se desvían de la configuración general del grupo (**R-C01..R-C05**).

### `POST /api/excepciones-prenda`
* **Descripción:** Registra una excepción delta sobre la prenda (**R-C01**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "prendaId": "pre_cm7a3001",
  "atributoId": "attr_cuello",
  "valorAtributoId": "val_cuello_v",
  "motivo": "Preferencia personal por comodidad"
}
```
* **Response (201 Created):**
```json
{
  "id": "exc_cm7a5001",
  "prendaId": "pre_cm7a3001",
  "atributoId": "attr_cuello",
  "valorAtributoId": "val_cuello_v",
  "motivo": "Preferencia personal por comodidad"
}
```

---

### `DELETE /api/excepciones-prenda/:id`
* **Descripción:** Elimina la excepción y devuelve la prenda al valor estándar del grupo (**R-C03**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "mensaje": "Excepción eliminada correctamente" }`

---

## 5. Personalizaciones y Estampados (Con JWT)

Estampados vinculantes con ubicación obligatoria del catálogo (**R-F01..R-F04**).

### `POST /api/personalizaciones`
* **Descripción:** Registra un estampado en una prenda (**R-F01**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "prendaId": "pre_cm7a3001",
  "ubicacionId": "ubic_espalda",
  "contenido": "MENDOZA"
}
```
* **Response (201 Created):**
```json
{
  "id": "pers_cm7a6001",
  "prendaId": "pre_cm7a3001",
  "ubicacionId": "ubic_espalda",
  "contenido": "MENDOZA"
}
```

---

### `DELETE /api/personalizaciones/:id`
* **Descripción:** Elimina el estampado de la prenda.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):** `{ "mensaje": "Personalización eliminada" }`

---

# PARTE II: FRENTE BK3 — DISEÑO, PRODUCCIÓN Y AUDITORÍA

---

## 6. Módulo de Diseño Gráfico y Versionado (`3-diseno`)

Gestiona el ciclo de vida del diseño: `BORRADOR` ➔ `PROPUESTO` ➔ `APROBADO` / `RECHAZADO`.

### `POST /api/disenos`
* **Descripción:** Crea una nueva versión secuencial de diseño (`v1, v2...`). Bloqueado si el bloque `DISENO` del pedido está cerrado (**R-H12**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "pedidoId": "ped_cm7a0001",
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1.png"
}
```
* **Response (201 Created):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "BORRADOR",
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1.png",
  "aprobadoEn": null,
  "aprobadoPorId": null
}
```

---

### `PATCH /api/disenos/:id/artefactos`
* **Descripción:** Reemplaza los archivos de diseño de una versión editable (`BORRADOR`, `PROPUESTO`, `RECHAZADO`). Audita atómicamente el diff (**R-I01**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1_corregido.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1_corregido.png"
}
```
* **Response (200 OK):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "BORRADOR",
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1_corregido.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1_corregido.png",
  "actualizadoEn": "2026-09-24T14:35:00.000Z"
}
```
* **Errores:** `400 Bad Request` si el bloque está cerrado (**R-H12**), `409 Conflict` si el diseño ya estaba `APROBADO`.

---

### `PATCH /api/disenos/:id/proponer`
* **Descripción:** Transiciona el diseño de `BORRADOR` a `PROPUESTO` para aprobación del cliente.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "PROPUESTO",
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1.png",
  "actualizadoEn": "2026-09-24T14:38:00.000Z"
}
```

---

### `PATCH /api/disenos/:id/aprobar`
* **Descripción:** **Candado Crítico R-H02 / R-H01.** Aprueba el diseño.
  * Valida que **todos los atributos marcados como obligatorios** (`obligatorio: true`) en todos los grupos del pedido tengan su respectivo `ValorConfiguracion` asignado (**R-H02**).
  * Dentro de `$transaction`, congela `aprobadoEn`, `aprobadoPorId`, registra auditoría y **cierra el bloque `DISENO` en `BloquePedido`** pasando a `CERRADO` (**R-H01**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "usuarioId": "usr_cm7a9001"
}
```
*(Nota: Si `usuarioId` se omite, se extrae automáticamente del JWT).*
* **Response (200 OK):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "APROBADO",
  "aprobadoEn": "2026-09-24T14:40:00.000Z",
  "aprobadoPorId": "usr_cm7a9001"
}
```
* **Errores:** `400 Bad Request` si faltan atributos obligatorios sin configurar (`R-H02`) o si el bloque ya estaba cerrado (`R-H12`).

---

### `PATCH /api/disenos/:id/rechazar`
* **Descripción:** Rechaza el diseño propuesto. El motivo explicativo se registra en `RegistroCambio` de forma atómica y limpia (no se ensucia el string del estado).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "motivo": "Los tonos del degradado en manga izquierda no coinciden con la muestra física"
}
```
* **Response (200 OK):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "RECHAZADO",
  "actualizadoEn": "2026-09-24T14:42:00.000Z"
}
```

---

### `GET /api/pedidos/:pedidoId/disenos`
* **Descripción:** Historial de versiones de diseño del pedido ordenadas de forma descendente.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
[
  {
    "id": "dis_cm7a7001",
    "pedidoId": "ped_cm7a0001",
    "version": 1,
    "estado": "APROBADO",
    "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1.ai",
    "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1.png",
    "aprobadoEn": "2026-09-24T14:40:00.000Z",
    "aprobadoPor": {
      "id": "usr_cm7a9001",
      "nombre": "Ana Ramos",
      "rol": "DISENO"
    }
  }
]
```

---

### `GET /api/disenos/:id`
* **Descripción:** Detalle técnico de una versión de diseño.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "id": "dis_cm7a7001",
  "pedidoId": "ped_cm7a0001",
  "version": 1,
  "estado": "APROBADO",
  "archivoUrl": "https://storage.sublitex.com/disenos/sub_2002_v1.ai",
  "imagenUrl": "https://storage.sublitex.com/mockups/sub_2002_v1.png",
  "aprobadoEn": "2026-09-24T14:40:00.000Z",
  "aprobadoPorId": "usr_cm7a9001"
}
```

---

## 7. Módulo de Taller, Nesting y Archivos TIF (`4-taller-produccion`)

Control de nesting multi-pedido (**R-K11**), restricciones de TIF (**R-K13**) y candado de producción (**R-H04**).

### `POST /api/nestings`
* **Descripción:** Crea un nesting de producción sobre un tipo de tela del catálogo. Ancho fijo oficial de 1.80 m (**R-K12**).
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "codigo": "NEST-2026-0042",
  "telaId": "val_tela_dryfit"
}
```
* **Response (201 Created):**
```json
{
  "id": "nst_cm7a8001",
  "codigo": "NEST-2026-0042",
  "telaId": "val_tela_dryfit",
  "anchoImpresionM": 1.80,
  "fecha": "2026-09-24T14:45:00.000Z",
  "creadoPorId": "usr_cm7a9001"
}
```

---

### `GET /api/nestings`
* **Descripción:** Lista los nestings con su tela, archivos vinculados y conteo de partes.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
[
  {
    "id": "nes_cm7a9001",
    "telaId": "tela_subli_01",
    "anchoUtilM": 1.80,
    "largoTotalM": 15.50,
    "desperdicioM2": 1.25,
    "creadoPorId": "usr_prod_01",
    "creadoEn": "2026-09-24T11:00:00.000Z",
    "tela": { "id": "tela_subli_01", "nombre": "Win Dry Sublimable" },
    "_count": { "partes": 12, "archivos": 3 }
  }
]
```

---

### `GET /api/nestings/:id`
* **Descripción:** Detalle completo del nesting con sus partes reales ordenadas por número y archivos TIF.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "id": "nes_cm7a9001",
  "telaId": "tela_subli_01",
  "anchoUtilM": 1.80,
  "largoTotalM": 15.50,
  "desperdicioM2": 1.25,
  "creadoPorId": "usr_prod_01",
  "creadoEn": "2026-09-24T11:00:00.000Z",
  "tela": { "id": "tela_subli_01", "nombre": "Win Dry Sublimable" },
  "partes": [
    {
      "id": "prt_cm7a8501",
      "nestingId": "nes_cm7a9001",
      "pedidoId": "ped_cm7a0001",
      "numeroParte": 1,
      "anchoCm": 172.0,
      "largoCm": 450.0,
      "areaM2": 7.74,
      "esRib": false,
      "creadoEn": "2026-09-24T11:15:00.000Z"
    }
  ],
  "archivos": [
    {
      "id": "tif_cm7a9601",
      "nestingId": "nes_cm7a9001",
      "nombre": "SUBLITEX_SUB-2002_DRYFIT_180x450_1de2.tif",
      "ordenEnSerie": 1,
      "totalSerie": 2,
      "largoM": 4.5,
      "archivoUrl": "https://vwcxibxfjfimpvgztbrv.supabase.co/storage/v1/object/public/sublitex-archivos/tifs/nes_9001_s1.tif",
      "creadoEn": "2026-09-24T11:30:00.000Z"
    }
  ]
}
```

---

### `POST /api/nestings/:id/partes`
* **Descripción:** **Candado Crítico R-H04.** Asigna una parte de corte a un pedido (**R-K11**).
  * Valida que tanto el bloque `DISENO` como el bloque `LISTA` del pedido estén en estado `CERRADO` (**R-H04**).
  * Auto-incrementa el número de parte y audita el cambio en `RegistroCambio` atómicamente.
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "pedidoId": "ped_cm7a0001",
  "anchoCm": 172,
  "largoCm": 450,
  "esRib": false
}
```
* **Response (201 Created):**
```json
{
  "id": "prt_cm7a8501",
  "nestingId": "nst_cm7a8001",
  "pedidoId": "ped_cm7a0001",
  "numeroParte": 1,
  "anchoCm": 172,
  "largoCm": 450,
  "esRib": false
}
```
* **Errores:** `400 Bad Request`: *"Producción no puede iniciar: el pedido debe tener los bloques de Diseño y Lista cerrados (R-H04)"*.

---

### `POST /api/nestings/:id/archivos`
* **Descripción:** Registra un archivo TIF exportado para el RIP.
  * Valida largo máximo físico de 5.00 metros (**R-K13**).
  * Valida coherencia de serie: `ordenEnSerie >= 1` y `ordenEnSerie <= totalSerie`.
* **Headers:** `Authorization: Bearer <JWT>`
* **Request Body:**
```json
{
  "nombre": "SUBLITEX_SUB-2002_DRYFIT_180x450_1de2.tif",
  "largoM": 4.50,
  "ordenEnSerie": 1,
  "totalSerie": 2,
  "entregadoEn": "2026-09-24T15:00:00.000Z"
}
```
* **Response (201 Created):**
```json
{
  "id": "tif_cm7a9601",
  "nestingId": "nes_cm7a9001",
  "nombre": "SUBLITEX_SUB-2002_DRYFIT_180x450_1de2.tif",
  "ordenEnSerie": 1,
  "totalSerie": 2,
  "largoM": 4.50,
  "archivoUrl": "https://vwcxibxfjfimpvgztbrv.supabase.co/storage/v1/object/public/sublitex-archivos/tifs/nes_9001_s1.tif",
  "entregadoEn": "2026-09-24T15:00:00.000Z",
  "creadoEn": "2026-09-24T11:30:00.000Z"
}
```
* **Errores:** `400 Bad Request` si `largoM > 5.00` o si `ordenEnSerie > totalSerie`.

---

### `GET /api/consumo-tela/pedido/:pedidoId`
* **Descripción:** Reporta el consumo exacto sumando **únicamente las partes de ese pedido** (**R-K15**).
  * Separa tela principal y rib (**R-K15**).
  * Calcula desperdicio lateral `180 - anchoMaximoUsadoCm` y `%` de aprovechamiento (**R-K12**).
  * Desglosa metros lineales por cada tipo de tela presente en el pedido.
  * Multiplica por la tarifa vigente de impresión (**R-K14**). Si no hay tarifa vigente, retorna `costoImpresion: null` con nota (**R-K10**, sin precios manuales).
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "pedidoId": "ped_cm7a0001",
  "pedidoCodigo": "SUB-2002",
  "partes": 3,
  "metrosTela": 12.50,
  "metrosRib": 1.20,
  "metrosLineales": 13.70,
  "anchoMaximoUsadoCm": 172,
  "desperdicioLateralCm": 8,
  "porcentajeAprovechamientoAncho": 95.56,
  "desglosePorTela": [
    {
      "telaId": "val_tela_dryfit",
      "telaNombre": "Dry Fit Microfibra",
      "metrosLineales": 12.50
    }
  ],
  "precioPorMetro": 5.50,
  "costoImpresion": 75.35,
  "nota": null
}
```

---

### `PATCH /api/taller/pedidos/:pedidoId/versiones/:versionId/acusar`
*(Alias equivalente en Gobernanza: `PATCH /api/pedidos/:id/bloques/versiones/:versionId/acusar` y `POST`)*
* **Descripción:** **Candado Crítico R-H14.** Registra el acuse de recibo formal en taller o diseño ante una reapertura de bloque en un pedido que ya cuenta con partes en producción.
  * Identifica el rol del usuario autenticado:
    * `DISENO`: Sella la columna `acusadoDisenoEn`.
    * `PRODUCCION`: Sella la columna `acusadoProduccionEn`.
    * `ADMINISTRADOR` / `COORDINADOR_OPERATIVO`: Puede especificar el área en el body (`"area": "DISENO" | "PRODUCCION" | "AMBAS"`) o sella por defecto el área pendiente.
  * **Idempotente:** Si la versión ya fue acusada previamente para esa área, retorna `yaAcusado: true` con la fecha original preservada sin error.
  * **Compatibilidad de Base de Datos:** Cuenta con fallback automático a la función `SECURITY DEFINER` de PostgreSQL (`acusar_recibo_version` en `01_constraints.sql`) si los permisos `UPDATE` sobre `VersionBloque` están revocados.
  * **Trazabilidad estricta (R-I01):** Escribe atómicamente un registro inmutable en `RegistroCambio` con la entidad `VersionBloque`, campo sellado, autor y rol.
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: application/json`
* **Request Body (Opcional para roles DISENO o PRODUCCION):**
```json
{
  "area": "PRODUCCION",
  "nota": "Enterado de reapertura v2: se ajusta la plancha para la talla XL -> XXL"
}
```
* **Response (200 OK):**
```json
{
  "mensaje": "Acuse de recibo formal registrado exitosamente para PRODUCCION (R-H14)",
  "yaAcusado": false,
  "area": "PRODUCCION",
  "version": {
    "id": "ver_cm7a9501",
    "bloqueId": "blq_cm7a5002",
    "numero": 2,
    "motivoReapertura": "Cambio de talla de Juan R. de XL a XXL",
    "acusadoDisenoEn": "2026-09-26T12:00:00.000Z",
    "acusadoProduccionEn": "2026-09-26T12:10:00.000Z",
    "creadoEn": "2026-09-26T11:45:00.000Z",
    "bloque": {
      "id": "blq_cm7a5002",
      "pedidoId": "ped_cm7a0001",
      "tipo": "LISTA",
      "estado": "ABIERTO"
    }
  }
}
```
* **Errores:**
  * `400 Bad Request`: Si la versión no pertenece al pedido especificado.
  * `403 Forbidden`: Si el rol del usuario no tiene autorización para acusar recibo (requiere `DISENO`, `PRODUCCION`, `ADMINISTRADOR` o `COORDINADOR_OPERATIVO`).
  * `404 Not Found`: Si el pedido o la versión del bloque no existen.

---

### `GET /api/taller/pedidos/:pedidoId/alertas-reapertura`
*(Alias equivalente en Gobernanza: `GET /api/pedidos/:id/bloques/versiones-pendientes-acuse`)*
* **Descripción:** Consulta todas las versiones de bloques reabiertas del pedido que tienen pendiente el acuse de recibo por parte de Diseño o de Producción (**R-H14**).
  * Reporta el semáforo `alertaTallerActiva: true` si el pedido ya cuenta con partes cargadas en un nesting de corte.
* **Headers:** `Authorization: Bearer <JWT>`
* **Response (200 OK):**
```json
{
  "pedidoId": "ped_cm7a0001",
  "alertaTallerActiva": true,
  "totalPendientes": 1,
  "versiones": [
    {
      "id": "ver_cm7a9501",
      "bloqueId": "blq_cm7a5002",
      "tipoBloque": "LISTA",
      "numero": 2,
      "motivoReapertura": "Cambio de talla de Juan R. de XL a XXL",
      "acusadoDisenoEn": "2026-09-26T12:00:00.000Z",
      "acusadoProduccionEn": null,
      "pendienteDiseno": false,
      "pendienteProduccion": true,
      "creadoEn": "2026-09-26T11:45:00.000Z",
      "creadoPor": {
        "id": "usr_coord_01",
        "nombre": "Carlos Coordinador",
        "email": "carlos@sublitex.com",
        "rol": "COORDINADOR_OPERATIVO"
      }
    }
  ]
}
```

---

## 8. Módulo de Auditoría e Inmutabilidad (Append-Only) (`5-auditoria`)

Garantiza la trazabilidad legal del pedido (**R-I01..R-I05**). Estrictamente append-only (no expone update ni delete).

### `GET /api/registros-cambio`
* **Descripción:** Lista el historial de cambios con filtros opcionales.
* **Headers:** `Authorization: Bearer <JWT>`
* **Query Parameters:**
  * `pedidoId` *(opcional)*: ID del pedido a auditar.
  * `entidad` *(opcional)*: Entidad afectada (`Diseno`, `Prenda`, `NestingParte`...).
  * `entidadId` *(opcional)*: ID del registro específico.
  * `origen` *(opcional)*: `USUARIO`, `PARTICIPANTE`, `SISTEMA`.
  * `autorUsuarioId` *(opcional)*: Filtrar por el usuario responsable (**R-I03**).
  * `campo` *(opcional)*: Filtrar por el atributo modificado (ej. `tallaId`, `estado`) (**R-I03**).
  * `limit` *(opcional, default 100, max 1000)*: Cantidad de registros.
* **Response (200 OK):**
```json
[
  {
    "id": "aud_cm7a9901",
    "pedidoId": "ped_cm7a0001",
    "entidad": "Diseno",
    "entidadId": "dis_cm7a7001",
    "campo": "estado",
    "valorAnterior": "PROPUESTO",
    "valorNuevo": "APROBADO",
    "origen": "USUARIO",
    "autorUsuarioId": "usr_cm7a9001",
    "autorParticipanteId": null,
    "autorRol": "DISENO",
    "prendasAfectadas": null,
    "creadoEn": "2026-09-24T14:40:00.000Z"
  }
]
```

---

## 9. Módulo de Almacenamiento Físico de Archivos (Supabase Storage)

Servicio transversal para carga y gestión de imágenes, mockups vectoriales y archivos TIF.

### `GET /api/archivos/estado`
* **Descripción:** Healthcheck que reporta si Supabase Storage está activo y configurado con credenciales en el servidor.
* **Seguridad:** Pública.
* **Response (200 OK):**
```json
{
  "configurado": true,
  "mensaje": "Supabase Storage está listo para recibir archivos."
}
```

---

### `POST /api/archivos/subir`
* **Descripción:** Sube un archivo binario a Supabase Storage y retorna su URL pública inmutable (**R-H11**, **R-K13**).
* **Headers:** `Authorization: Bearer <JWT>`, `Content-Type: multipart/form-data`
* **Query Params:** `?carpeta=disenos|mockups|tifs|general` (opcional).
* **Form-Data:** `archivo: File (binario)`
* **Response (201 Created):**
```json
{
  "url": "https://vwcxibxfjfimpvgztbrv.supabase.co/storage/v1/object/public/sublitex-archivos/disenos/1711234567890_arte.png",
  "path": "disenos/1711234567890_arte.png",
  "nombreOriginal": "arte.png",
  "mimetype": "image/png",
  "tamanoBytes": 2048500
}
```

---

### `DELETE /api/archivos`
* **Descripción:** Elimina un archivo físico del bucket de Supabase por su path relativo.
* **Headers:** `Authorization: Bearer <JWT>`
* **Query Params:** `?path=disenos/1711234567890_arte.png` (requerido).
* **Response (200 OK):**
```json
{
  "eliminado": true
}
```

---

# PARTE III: MATRIZ RESUMEN DE ENDPOINTS (BK2 + BK3 + STORAGE)

Lista consolidada de los **39 endpoints** que componen la frontera operativa de **BK2, BK3 y Core Storage**:

| # | Frente | Módulo | Método | Endpoint | Resumen Funcional | Seguridad |
|---|---|---|:---:|---|---|---|
| **1** | BK2 | Participantes | `GET` | `/api/participantes/enlace/:token` | Carga ficha del alumno desde WhatsApp | Público (Token) |
| **2** | BK2 | Participantes | `PUT` | `/api/participantes/enlace/:token/ficha` | Guarda ficha mínima (`REGISTRADO`) | Público (Token) |
| **3** | BK2 | Participantes | `POST` | `/api/participantes/enlace/:token/confirmar` | Visto bueno final (`CONFIRMADO`) | Público (Token) |
| **4** | BK2 | Participantes | `POST` | `/api/grupos/:grupoId/participantes` | Alta de participante y token WhatsApp | JWT |
| **5** | BK2 | Participantes | `GET` | `/api/grupos/:grupoId/participantes` | Lista participantes del grupo | JWT |
| **6** | BK2 | Participantes | `GET` | `/api/grupos/:grupoId/enlaces-whatsapp` | Compilador y exportador de enlaces para WhatsApp grupal | JWT |
| **7** | BK2 | Participantes | `GET` | `/api/participantes/:id` | Detalle individual del participante | JWT |
| **8** | BK2 | Participantes | `POST` | `/api/participantes/:id/confirmar` | Confirmación manual del coordinador | JWT |
| **9** | BK2 | Participantes | `POST` | `/api/participantes/:id/revocar-enlace` | Revoca enlace de WhatsApp | JWT |
| **10** | BK2 | Participantes | `POST` | `/api/participantes/:id/regenerar-enlace` | Regenera enlace de WhatsApp | JWT |
| **11** | BK2 | Participantes | `DELETE` | `/api/participantes/:id` | Elimina participante si lista está abierta | JWT |
| **12** | BK2 | Prendas | `POST` | `/api/prendas` | Crea prenda asignada a participante | JWT |
| **13** | BK2 | Prendas | `PATCH` | `/api/prendas/:id` | Actualiza ficha mínima (candado R-H03) | JWT |
| **14** | BK2 | Prendas | `DELETE` | `/api/prendas/:id` | Elimina prenda si lista está abierta | JWT |
| **15** | BK2 | Prendas | `GET` | `/api/pedidos/:pedidoId/resumen-produccion` | Resumen por piezas físicas (R-K03) | JWT |
| **16** | BK2 | Prendas | `GET` | `/api/pedidos/:pedidoId/diagnostico-cierre-lista` | Diagnóstico previo al cierre de lista (R-H09, R-I08) | JWT |
| **17** | BK2 | Excepciones | `POST` | `/api/excepciones-prenda` | Registra delta de configuración (R-C01) | JWT |
| **18** | BK2 | Excepciones | `DELETE` | `/api/excepciones-prenda/:id` | Elimina delta y vuelve al estándar | JWT |
| **19** | BK2 | Personalizaciones | `POST` | `/api/personalizaciones` | Registra estampado con ubicación (R-F01) | JWT |
| **20** | BK2 | Personalizaciones | `DELETE` | `/api/personalizaciones/:id` | Elimina estampado de la prenda | JWT |
| **21** | BK3 | Diseño | `POST` | `/api/disenos` | Crea versión de diseño (candado R-H12) | JWT |
| **22** | BK3 | Diseño | `PATCH` | `/api/disenos/:id/artefactos` | Reemplaza archivos vectoriales/mockup | JWT |
| **23** | BK3 | Diseño | `PATCH` | `/api/disenos/:id/proponer` | Pasa diseño a `PROPUESTO` | JWT |
| **24** | BK3 | Diseño | `PATCH` | `/api/disenos/:id/aprobar` | Candado R-H02 / Cierra bloque DISENO | JWT |
| **25** | BK3 | Diseño | `PATCH` | `/api/disenos/:id/rechazar` | Rechaza diseño con motivo auditado | JWT |
| **26** | BK3 | Diseño | `GET` | `/api/pedidos/:pedidoId/disenos` | Historial de versiones de diseño | JWT |
| **27** | BK3 | Diseño | `GET` | `/api/disenos/:id` | Detalle de una versión de diseño | JWT |
| **28** | BK3 | Taller | `POST` | `/api/nestings` | Crea nesting sobre tipo de tela | JWT |
| **29** | BK3 | Taller | `GET` | `/api/nestings` | Lista de nestings con métricas | JWT |
| **30** | BK3 | Taller | `GET` | `/api/nestings/:id` | Detalle de nesting con partes y TIFs | JWT |
| **31** | BK3 | Taller | `POST` | `/api/nestings/:id/partes` | Candado R-H04 (exige Diseño y Lista) | JWT |
| **32** | BK3 | Taller | `POST` | `/api/nestings/:id/archivos` | Registra archivo TIF (largo ≤ 5m R-K13) | JWT |
| **33** | BK3 | Taller | `GET` | `/api/consumo-tela/pedido/:pedidoId` | Consumo por pedido y desperdicio lateral | JWT |
| **34** | BK3 | Taller | `PATCH` | `/api/taller/pedidos/:pedidoId/versiones/:versionId/acusar` | Acuse de recibo formal en taller ante reapertura (R-H14) | JWT |
| **35** | BK3 | Taller | `GET` | `/api/taller/pedidos/:pedidoId/alertas-reapertura` | Lista versiones reabiertas con acuse pendiente en taller (R-H14) | JWT |
| **36** | BK3 | Auditoría | `GET` | `/api/registros-cambio` | Historial append-only (R-I01..R-I05) | JWT |
| **37** | Core | Storage | `GET` | `/api/archivos/estado` | Healthcheck de Supabase Storage | Público |
| **38** | Core | Storage | `POST` | `/api/archivos/subir` | Sube archivo a Supabase Storage y retorna URL pública | JWT |
| **39** | Core | Storage | `DELETE` | `/api/archivos` | Elimina archivo de Supabase Storage por path | JWT |
