# 📑 Informe Técnico: Actualización de Endpoints para Frontend — SIPES Sublitex

**Fecha:** 25 de Septiembre de 2026  
**Proyecto:** SIPES (*Sistema de Información y Pedidos para la Empresa Sublitex*)  
**Destinatario:** Equipo de Desarrollo Frontend (`sipes-next`)  
**Base URL Backend:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api/docs`  

---

## 📌 1. Resumen Ejecutivo

El backend ha completado la unificación operativa de sus tres frentes de trabajo:
* **BK1 (Núcleo Comercial y Gobernanza):** 37 endpoints.
* **BK2 (Operación de Prendas y Participantes):** 16 endpoints.
* **BK3 (Diseño, Taller-Producción y Auditoría):** 14 endpoints.
* **Total consolidado en plataforma:** **67 endpoints**.

El presente informe detalla:
1. Qué endpoints actualmente consumidos por `sipes-next` requieren **aumentar campos en los payloads (DTOs)** o **ajustar interfaces de respuesta**.
2. Cuáles son los **nuevos endpoints disponibles** que el frontend debe adoptar para cubrir las reglas de negocio críticas del negocio y los requerimientos del Excel operativo (`Hoja_Pedido_Sublitex.xlsx`).

---

## 🟡 2. Endpoints en uso que DEBEN ACTUALIZARSE

Son endpoints que el frontend ya consume en `sipes-next/src/features/*`, pero donde el backend agregó parámetros, soporta payloads ampliados o modificó la estructura de respuesta.

### 2.1. `POST /api/pedidos` (Creación de Pedido)
* **Estado actual en Frontend:** Solo envía `{ clienteId, fechaCompromiso, observaciones }`.
* **Campo a aumentar:**
  * `vendedoraId` *(string CUID, opcional)*: Permite asignar la asesora comercial que cerró la venta. El backend también acepta `vendedorId` por compatibilidad.
* **Nuevo Request Body:**
  ```json
  {
    "clienteId": "cuid_cliente_01",
    "fechaCompromiso": "2026-10-30T00:00:00.000Z",
    "vendedoraId": "cuid_usr_vendedora",
    "observaciones": "Entrega para desfile escolar"
  }
  ```

---

### 2.2. `PATCH /api/pedidos/:id` (Actualización de Cabecera — NUEVO MÉTODO)
* **Estado actual en Frontend:** Solo existe acción para cambiar estado (`PATCH /api/pedidos/:id/estado`).
* **Mejora:** Se debe crear una server action para actualizar la información básica del pedido sin reiniciar su ciclo de vida.
* **Request Body:**
  ```json
  {
    "fechaCompromiso": "2026-11-15T00:00:00.000Z",
    "vendedoraId": "cuid_nueva_vendedora",
    "observaciones": "Observaciones modificadas"
  }
  ```

---

### 2.3. `GET /api/pedidos` (Listado de Pedidos)
* **Estado actual en Frontend:** La interfaz `PedidoResumen` no incluye los nuevos cálculos automáticos del backend.
* **Campos nuevos a tipar en `PedidoResumen`:**
  * `tiempoDias` *(número)*: Días calendario faltantes para la fecha de compromiso calculados por el backend.
  * `totalPrendas` *(número)*: Suma total de prendas registradas en los grupos del pedido.
  * `vendedora` *(objeto `{ id, nombre, email }` o `null`)*: Relación poblada de la asesora asignada.

---

### 2.4. `POST /api/pedidos/:id/colores` (Agregar Colores)
* **Estado actual en Frontend:** La acción envía los colores uno por uno.
* **Mejora Backend:** Ahora admite recibir tanto un objeto individual como un arreglo no vacío (`batch`):
  ```json
  [
    { "nombre": "Azul Marino", "codigoHex": "#001489", "referenciaFisica": "Pantone 287C" },
    { "nombre": "Blanco Hueso", "codigoHex": "#F7F4F2" }
  ]
  ```

---

### 2.5. `PATCH /api/prendas/:id` (Edición de Prenda)
* **Estado actual en Frontend:** El modal y la acción `actionActualizarPrenda` solo envían `{ tallaId, numero, genero, nombreEnPrenda }`.
* **Campo a aumentar:**
  * `colorId` *(string CUID, opcional)*: Permite asignar o cambiar el color oficial de una prenda (clave para prendas de arquero o combinaciones alternativas).
* **Nuevo Request Body:**
  ```json
  {
    "tallaId": "cuid_talla_l",
    "numero": "10",
    "genero": "HOMBRE",
    "nombreEnPrenda": "GARCIA",
    "colorId": "cuid_color_arquero"
  }
  ```
* **Validación Backend:** Valida que `colorId` pertenezca a la paleta oficial del pedido (`R-K05`) y que el bloque `LISTA` esté abierto (`R-H03`).

---

### 2.6. `PATCH /api/grupos/:id` / `PUT /api/grupos/:id` (Edición de Grupo)
* **Estado actual en Frontend:** Solo actualiza nombre y cantidad contratada.
* **Campo a aumentar:**
  * `configuracion` *(array opcional)*: Permite actualizar los atributos base del grupo (tela, corte general, tipo de cuello) para que las prendas hereden la nueva configuración:
    ```json
    {
      "nombre": "Conjunto Titular Actualizado",
      "cantidadContratada": 30,
      "configuracion": [
        { "atributoId": "cuid_atrib_tela", "valorAtributoId": "cuid_val_dryfit" },
        { "atributoId": "cuid_atrib_cuello", "valorAtributoId": "cuid_val_redondo" }
      ]
    }
    ```

---

### 2.7. `POST /api/auth/register` (Registro de Usuario)
* **Campo a actualizar en Enum:** El rol de usuario ahora incluye `VENDEDOR` además de `VENDEDORA`.
  * Roles soportados: `ADMINISTRADOR` | `COORDINADOR_OPERATIVO` | `VENDEDOR` | `VENDEDORA` | `COORDINADOR_CLIENTE` | `DISENO` | `PRODUCCION`.

---

### 2.8. `PATCH /api/auth/:id/password` (Reseteo de Clave)
* **Comportamiento mejorado:** Si el usuario que ejecuta la acción tiene rol `ADMINISTRADOR`, el campo `currentPassword` es opcional, permitiendo blanqueo administrativo de claves.

---

## 🔵 3. Nuevos Endpoints Disponibles en el Backend

Estos endpoints fueron desplegados en el backend y requieren ser integrados en nuevas vistas y acciones del frontend:

### 3.1. Gobernanza de Bloques y Candados Operativos (BK1)
Permite congelar y reabrir de manera independiente las tres áreas del pedido:

| Método | Endpoint | Descripción | Payload / Parámetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/pedidos/:id/bloques` | Lista el estado (`ABIERTO` o `CERRADO`) de los 3 bloques (`DISENO`, `LISTA`, `COMERCIAL`), su versión activa y usuario responsable. | *Ninguno.* |
| `POST` | `/api/pedidos/:id/bloques/:tipo/cerrar` | Cierra formalmente un bloque y genera un snapshot inmutable en `VersionBloque` (`R-H11`).<br>• Si es `LISTA`: valida que las prendas cargadas igualen la cantidad contratada y congela edición.<br>• Si es `DISENO`: valida que exista diseño aprobado. | `:tipo` = `DISENO` \| `LISTA` \| `COMERCIAL` |
| `POST` | `/api/pedidos/:id/bloques/:tipo/reabrir` | Reabre un bloque cerrado generando una nueva versión auditable (`R-H13`). | **Body Obligatorio:**<br>`{ "motivoReapertura": "string mín. 5 caracteres" }`<br>**Respuesta:** Contiene `alertaTaller: boolean` si ya se mandó tela a corte (`R-H14`). |
| `GET` | `/api/pedidos/:id/bloques/:tipo/versiones` | Historial de versiones del bloque con snapshot JSON y diffs. | `:tipo` = `DISENO` \| `LISTA` \| `COMERCIAL` |

---

### 3.2. Módulo de Diseño Gráfico y Mockups (BK3)
Reemplaza los acuerdos por chat con un flujo trazable de aprobación gráfica:

| Método | Endpoint | Descripción | Payload / Parámetros |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/disenos` | Crea una nueva versión secuencial de diseño (`v1, v2...`). | **Body:**<br>`{ "pedidoId": "...", "archivoUrl": "...", "imagenUrl": "..." }` |
| `GET` | `/api/pedidos/:pedidoId/disenos` | Historial descendente de todas las versiones de diseño y mockups del pedido. | *Ninguno.* |
| `PATCH` | `/api/disenos/:id/proponer` | Pasa el diseño a estado `PROPUESTO` para revisión del cliente o coordinador. | *Ninguno.* |
| `PATCH` | `/api/disenos/:id/aprobar` | **Candado Crítico R-H02 / R-H01:** Aprueba el diseño, valida que no falten atributos obligatorios y **cierra automáticamente el bloque `DISENO`**. | **Body:** `{ "usuarioId": "..." }` *(opcional, se toma de JWT).* |
| `PATCH` | `/api/disenos/:id/rechazar` | Rechaza el diseño registrando la observación en auditoría. | **Body:** `{ "motivo": "explicación detallada" }` |

---

### 3.3. Módulo de Taller, Nesting y Tela (BK3)
Métricas directas para corte y producción textil (Pestañas `MEDIDAS` y `DETALLE` de Excel):

| Método | Endpoint | Descripción | Payload / Parámetros |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/consumo-tela/pedido/:pedidoId` | Reporte exacto de consumo para el pedido: metros de tela principal, metros de rib, ancho usado sobre 1.80 m, desperdicio y costo de impresión (`R-K15`). | *Ninguno.* |
| `GET` | `/api/nestings` | Lista de nestings (rollos de impresión) del taller. | *Filtros opcionales.* |
| `POST` | `/api/nestings` | Crea un rollo de nesting definiendo el tipo de tela base (`R-K12`). | **Body:** `{ "codigo": "NEST-01", "telaId": "..." }` |
| `POST` | `/api/nestings/:id/partes` | **Candado R-H04:** Asigna una parte de corte al pedido. Exige que los bloques `DISENO` y `LISTA` estén `CERRADOS`. | **Body:** `{ "pedidoId": "...", "anchoCm": 172, "largoCm": 450, "esRib": false }` |
| `POST` | `/api/nestings/:id/archivos` | Registra un archivo TIF generado para el RIP (máximo 5 metros por archivo - `R-K13`). | **Body:** `{ "nombre": "...", "largoM": 4.5, "ordenEnSerie": 1, "totalSerie": 2 }` |

---

### 3.4. Módulo de Auditoría y Trazabilidad (BK3)
| Método | Endpoint | Descripción | Query Params |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/registros-cambio` | Historial append-only de modificaciones. Registra quién cambió qué campo, valor previo y nuevo. | `?pedidoId=...`<br>`?entidad=PRENDA`<br>`?entidadId=...` |

---

### 3.5. Módulo Comercial: Confirmaciones y Pagos (BK1)
| Método | Endpoint | Descripción | Payload |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/pedidos/:id/confirmaciones` | Emite la confirmación formal del pedido con totales congelados, cálculo del 50% de adelanto, saldo e IGV (`R-K06`). | **Body:**<br>`{ "adelantoRecibido": 450, "comprobante": "FACTURA", "recargoTallas": 30, "recargoTelas": 40, "recargoCuellos": 15, "recargoAcabados": 0, "adicionales": 20, "pdfUrl": "..." }` |

---

## 🚀 4. Matriz de Priorización para el Frontend

Para organizar el trabajo de forma ágil sin romper lo existente, se recomienda seguir estas 3 etapas:

```
ETAPA 1 (Inmediata · Ajustes de Datos)
├── Aumentar colorId en PATCH /api/prendas/:id
├── Aumentar vendedoraId en POST /api/pedidos
└── Tipar tiempoDias y totalPrendas en PedidoResumen

ETAPA 2 (Gobernanza y Taller)
├── Consumir /api/pedidos/:id/bloques en la cabecera (Semáforo de Bloques)
├── Deshabilitar edición de prendas cuando el bloque LISTA esté CERRADO
└── Tablero de resumen físico en /pedidos/[id]/prendas (camisetas, shorts, medias)

ETAPA 3 (Vistas Nuevas)
├── Ficha Técnica Operativa para Taller sin precios (/pedidos/[id]/ficha-tecnica)
├── Pestaña de Diseño y Mockup (/pedidos/[id]/diseno) con aprobación formal
└── Panel de Auditoría / Historial de Cambios
```
