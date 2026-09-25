# 📡 Catálogo Oficial de Endpoints — SIPES Backend

**Proyecto:** SIPES (*Sistema de Información y Pedidos para la Empresa Sublitex*)  
**Fecha de corte:** 24 de Septiembre de 2026  
**Host base:** `http://localhost:3001`  
**Swagger UI:** `http://localhost:3001/api/docs`  

---

## 📑 Resumen General por Frente

| Frente | Módulos | Controladores | Total Endpoints | Seguridad Principal |
|---|---|---|:---:|---|
| **BK2** | Operación de Prendas | 5 controladores | **17** | JWT (Privados) + Token Enlace (Públicos) |
| **BK3** | Diseño · Taller-Producción · Auditoría | 3 controladores | **14** | JWT Bearer Token |
| **BK1** | Núcleo Comercial · Gobernanza · Auth | 8 controladores | **37** | JWT Bearer Token |
| **Core** | Infraestructura / Supabase Storage | 1 controlador | **3** | JWT Bearer Token / Healthcheck |
| **TOTAL** | **Plataforma Completa** | **17 controladores** | **71** | **Seguridad integral por roles** |

---

## 🟡 SECCIÓN 1: FRENTE BK2 — OPERACIÓN DE PRENDAS (`2-operacion-prendas`)

### 1.1 Participantes: Portal Móvil de WhatsApp (Sin JWT / Acceso Público Seguro)
> **Módulo:** `2-operacion-prendas/participantes`  
> **Controlador:** `ParticipantesPublicController`  
> **Autenticación:** Pública mediante `enlaceToken` único de un solo uso por participante (`R-D05`, `R-D06`, `R-J05`).

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `GET` | `/api/participantes/enlace/:token` | Carga inicial de la ficha del participante y sus prendas asignadas desde el enlace que recibió por WhatsApp. | `R-D05`, `R-J06` |
| `PUT` | `/api/participantes/enlace/:token/ficha` | Guarda o actualiza la ficha mínima del participante (talla, número, corte, color y apodo). Pasa el estado a `REGISTRADO`. | `R-D03`, `R-E03` |
| `POST` | `/api/participantes/enlace/:token/confirmar` | Confirmación definitiva por parte del alumno/padre. Pasa el estado a `CONFIRMADO` y congela la edición del token. | `R-D03`, `R-D06` |

---

### 1.2 Participantes: Gestión Interna y Administrativa (Con JWT)
> **Módulo:** `2-operacion-prendas/participantes`  
> **Controlador:** `ParticipantesController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/grupos/:grupoId/participantes` | Da de alta a un participante en el grupo, generando automáticamente su `enlaceToken` de WhatsApp. | `R-D01`, `R-D05` |
| `GET` | `/api/grupos/:grupoId/participantes` | Lista todos los participantes del grupo con sus prendas, personalizaciones y estado de confirmación. | `R-D01`, `R-J07` |
| `GET` | `/api/grupos/:grupoId/enlaces-whatsapp` | Compila todos los enlaces públicos del grupo con URLs completas y el mensaje formateado para WhatsApp grupal (soporta `?soloPendientes=true`). | `R-D05`, `R-D06`, `R-I04` |
| `GET` | `/api/participantes/:id` | Obtiene el detalle individual de un participante y sus prendas. | `R-D02` |
| `POST` | `/api/participantes/:id/confirmar` | Confirmación manual administrativa de un participante por parte del coordinador. | `R-D03` |
| `POST` | `/api/participantes/:id/revocar-enlace` | Invalida de inmediato el enlace de WhatsApp de un participante por seguridad. | `R-D06` |
| `POST` | `/api/participantes/:id/regenerar-enlace` | Genera un nuevo token y enlace de WhatsApp vigente para el participante. | `R-D05`, `R-D06` |
| `DELETE` | `/api/participantes/:id` | Elimina a un participante y sus prendas, siempre que el bloque `LISTA` esté abierto. | `R-D07`, `R-H03` |

---

### 1.3 Prendas: Fichas Mínimas y Resumen Consolidado (Con JWT)
> **Módulo:** `2-operacion-prendas/prendas`  
> **Controlador:** `PrendasController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/prendas` | Crea una nueva prenda vinculada a un participante del grupo. | `R-E01`, `R-E02` |
| `PATCH` | `/api/prendas/:id` | Actualiza la ficha mínima de la prenda (talla, número, corte, apodo, color). Valida paleta de color del pedido y candado de lista. | `R-E03`, `R-K05`, `R-H03` |
| `DELETE` | `/api/prendas/:id` | Elimina una prenda de la lista del grupo si el bloque `LISTA` sigue abierto. | `R-H03` |
| `GET` | `/api/pedidos/:pedidoId/resumen-produccion` | Resumen consolidado para taller multiplicando por piezas físicas reales (camisetas, shorts, medias), nunca solo por prendas. | `R-E07`, `R-K03` |

---

### 1.4 Excepciones: Arquitectura Delta (Con JWT)
> **Módulo:** `2-operacion-prendas/excepciones`  
> **Controlador:** `ExcepcionesController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/excepciones-prenda` | Registra una excepción delta sobre un atributo de la prenda (ej. corte femenino, manga larga) sin duplicar el registro base. | `R-C01..R-C05` |
| `DELETE` | `/api/excepciones-prenda/:id` | Elimina la excepción y devuelve automáticamente la prenda al valor por defecto configurado en el grupo. | `R-C03` |

---

### 1.5 Personalizaciones: Estampados y Ubicaciones (Con JWT)
> **Módulo:** `2-operacion-prendas/personalizaciones`  
> **Controlador:** `PersonalizacionesController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/personalizaciones` | Registra un estampado asociando obligatoriamente terna: prenda, ubicación del catálogo y texto exacto. | `R-F01..R-F04` |
| `DELETE` | `/api/personalizaciones/:id` | Elimina un estampado personalizado de la prenda. | `R-F01` |

---

## 🟣 SECCIÓN 2: FRENTE BK3 — DISEÑO, TALLER-PRODUCCIÓN Y AUDITORÍA

### 2.1 Diseño Gráfico y Aprobación (`3-diseno`)
> **Módulo:** `3-diseno/diseno`  
> **Controlador:** `DisenoController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/disenos` | Crea una nueva versión secuencial de diseño (`v1, v2...`) para el pedido. Bloqueado si el bloque `DISENO` ya fue cerrado. | `R-H11`, `R-H12` |
| `PATCH` | `/api/disenos/:id/artefactos` | Reemplaza archivo vectorial (`archivoUrl`) o vista previa (`imagenUrl`) de un diseño editable. Bloqueado si el bloque está cerrado. | `R-H12`, `R-I01` |
| `PATCH` | `/api/disenos/:id/proponer` | Transiciona el diseño de estado `BORRADOR` a `PROPUESTO` para revisión formal del cliente. | `R-H01` |
| `PATCH` | `/api/disenos/:id/aprobar` | **Candado Crítico:** Aprueba el diseño validando que todos los atributos obligatorios del grupo tengan valor asignado. Cierra atómicamente el bloque `DISENO`. | `R-H01`, `R-H02`, `R-I01` |
| `PATCH` | `/api/disenos/:id/rechazar` | Rechaza el diseño con motivo explicativo registrado como campo de auditoría independiente. | `R-I01` |
| `GET` | `/api/pedidos/:pedidoId/disenos` | Lista el historial completo de versiones de diseño del pedido ordenadas de forma descendente. | `R-H11` |
| `GET` | `/api/disenos/:id` | Obtiene el detalle técnico de una versión de diseño y su usuario aprobador. | `R-H11` |

---

### 2.2 Taller, Nesting y Corte de Tela (`4-taller-produccion`)
> **Módulo:** `4-taller-produccion/nesting`  
> **Controlador:** `NestingController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/nestings` | Crea un nesting de producción asociado a un tipo de tela del catálogo. | `R-K11`, `R-K12` |
| `GET` | `/api/nestings` | Lista todos los nestings con conteo de partes y archivos exportados. | `R-K11` |
| `GET` | `/api/nestings/:id` | Detalle del nesting con sus partes asignadas ordenadas y sus archivos TIF vinculados. | `R-K11` |
| `POST` | `/api/nestings/:id/partes` | **Candado de Taller:** Agrega una parte real (ancho/largo en cm) cargada a un pedido. Rechaza estrictamente si los bloques `DISENO` o `LISTA` están abiertos. | `R-H04`, `R-K11`, `R-I01` |
| `POST` | `/api/nestings/:id/archivos` | Registra un archivo TIF exportado para impresión. Valida límite físico de 5 metros de largo y correlatividad de serie (`orden <= total`). | `R-K13` |
| `GET` | `/api/consumo-tela/pedido/:pedidoId` | Reporta el consumo exacto sumando solo las partes del pedido. Entrega metros de tela, rib, desperdicio lateral (`180 - anchoMaximo`) y costo por tarifa vigente. | `R-K10`, `R-K12`, `R-K14`, `R-K15` |

---

### 2.3 Auditoría e Historial de Cambios (`5-auditoria`)
> **Módulo:** `5-auditoria/auditoria`  
> **Controlador:** `AuditoriaController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `GET` | `/api/registros-cambio` | Consulta el historial inmutable append-only de modificaciones. Soporta filtros por `pedidoId`, `entidad`, `entidadId`, `origen`, `autorUsuarioId` y `campo`. | `R-I01..R-I05` |

---

## 🟢 SECCIÓN 3: FRENTE BK1 — NÚCLEO COMERCIAL Y GOBERNANZA (`1-nucleo-comercial`)

### 3.1 Bloques de Pedido y Gobernanza de Candados
> **Módulo:** `1-nucleo-comercial/bloques`  
> **Controlador:** `BloqueController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `GET` | `/api/pedidos/:id/bloques` | Consulta el semáforo consolidado de los tres bloques (`DISENO`, `LISTA`, `COMERCIAL`). Si no existen, los inicializa en `ABIERTO`. | `R-H01`, `R-H11` |
| `POST` | `/api/pedidos/:id/bloques/:tipo/cerrar` | Cierra formalmente un bloque (`LISTA` o `COMERCIAL`). Para Lista valida cero prendas incompletas (`R-E03`), sin números duplicados (`R-G03`) y cuadre con cantidad contratada (`R-B02`). Congela snapshot inmutable. | `R-H01`, `R-H03`, `R-H11` |
| `POST` | `/api/pedidos/:id/bloques/:tipo/reabrir` | Reapertura formal de un bloque cerrado. Exige `motivoReapertura` obligatorio, calcula diff inmutable y activa `alertaTaller` si el pedido ya tiene partes en corte. | `R-H12`, `R-H13`, `R-H14` |

---

### 3.2 Pedidos Comerciales y Ciclo de Vida
> **Módulo:** `1-nucleo-comercial/pedidos`  
> **Controlador:** `PedidoController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/pedidos` | Crea un pedido en estado `BORRADOR` con código correlativo (`SUB-XXXX`). Asigna vendedora autenticada por defecto. | `R-A01..R-A04` |
| `GET` | `/api/pedidos` | Lista general de pedidos con estado global, semáforo de bloques, vendedora asignada y cálculo dinámico de `tiempoDias`. | `R-A05`, `R-J04` |
| `GET` | `/api/pedidos/:id` | Detalle integral del pedido con cliente, grupos, paleta de colores y bloques. | `R-A01` |
| `PATCH` | `/api/pedidos/:id` | Actualiza datos generales del pedido (`fechaCompromiso`, `vendedoraId`, `observaciones`). Valida que compromiso sea posterior al pedido. | `R-A09` |
| `PATCH` | `/api/pedidos/:id/estado` | Avanza el estado lineal del pedido hacia adelante (`BORRADOR` ➔ `EN_CONFIGURACION` ➔ `EN_PRODUCCION`...). | `R-A06` |
| `POST` | `/api/pedidos/:id/cancelar` | Cancela un pedido en curso registrando fecha y motivo de cancelación. | `R-A06` |
| `POST` | `/api/pedidos/:id/colores` | Agrega un color oficial a la paleta del pedido con su código HEX obligatorio. | `R-K05` |
| `GET` | `/api/pedidos/:id/colores` | Lista la paleta de colores autorizados para las prendas del pedido. | `R-K05` |
| `DELETE` | `/api/pedidos/:id/colores/:colorId` | Elimina un color de la paleta si no está en uso por prendas. | `R-K05` |
| `GET` | `/api/pedidos/:id/conciliacion-comercial` | Reporte de cuadre entre la cantidad contratada comercialmente vs prendas registradas en los grupos. | `R-B02`, `R-K03` |

---

### 3.3 Clientes
> **Módulo:** `1-nucleo-comercial/clientes`  
> **Controlador:** `ClienteController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/clientes` | Da de alta un nuevo cliente u organización (Colegio, Promoción, Empresa, Club, Particular). | `R-A01` |
| `GET` | `/api/clientes` | Lista y buscador avanzado de clientes (`?q=texto`) con búsqueda insensible en nombre y ciudad. | `R-A01` |
| `GET` | `/api/clientes/:id` | Detalle del cliente incluyendo el historial de todos sus pedidos asociados. | `R-A01` |
| `PATCH` | `/api/clientes/:id` | Actualiza información de contacto del cliente (teléfono, ciudad, nombre). | `R-A01` |
| `DELETE` | `/api/clientes/:id` | Desactiva lógicamente un cliente del sistema. | `R-A01` |

---

### 3.4 Grupos de Pedido y Políticas de Numeración
> **Módulo:** `1-nucleo-comercial/grupos`  
> **Controlador:** `GrupoController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/grupos` | Crea un grupo dentro del pedido (ej. "Camisetas", "Conjuntos") con su cantidad contratada y tipo de producto. | `R-B01`, `R-B02` |
| `GET` | `/api/pedidos/:pedidoId/grupos` | Lista todos los grupos configurados para un pedido. | `R-B01` |
| `GET` | `/api/grupos/:id` | Obtiene el detalle de un grupo con su configuración general de atributos. | `R-B03` |
| `PATCH` | `/api/grupos/:id` | Modifica datos del grupo u observaciones no vinculantes. | `R-F06` |
| `DELETE` | `/api/grupos/:id` | Elimina un grupo si no tiene participantes ni prendas asociadas. | `R-B01` |
| `PUT` | `/api/grupos/:id/politica-numeracion` | Configura política de numeración (`LIBRE` o `UNICA`). Bloquea cambiar a `UNICA` si ya existen dorsales repetidos. | `R-G01`, `R-G06` |
| `PUT` | `/api/grupos/:id/configuracion` | Configura los atributos generales del grupo (tela, cuello, manga, corte). Base para resolver valores efectivos. | `R-B03`, `R-B07` |

---

### 3.5 Comercial, Tarifas y Confirmaciones Financieras
> **Módulo:** `1-nucleo-comercial/comercial`  
> **Controlador:** `ComercialController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/comercial/tarifas` | Crea una nueva tarifa oficial con fecha de vigencia (costos de impresión, confección o recargos). | `R-K10` |
| `GET` | `/api/comercial/tarifas` | Lista general de tarifas con filtro opcional por tipo (`COSTO_INTERNO`, `PRECIO_VENTA`, `RECARGO`). | `R-K10` |
| `GET` | `/api/comercial/tarifas/vigentes` | Consulta únicamente las tarifas vigentes a la fecha actual para cotización automática. | `R-K10`, `R-K14` |
| `GET` | `/api/comercial/tarifas/:id` | Detalle individual de una tarifa registrada. | `R-K10` |
| `PATCH` | `/api/comercial/tarifas/:id` | Actualiza el valor o vigencia de una tarifa. | `R-K10` |
| `DELETE` | `/api/comercial/tarifas/:id` | Desactiva una tarifa del catálogo. | `R-K10` |
| `POST` | `/api/comercial/pedidos/:pedidoId/datos-envio` | Registra los 7 datos de rotulado obligatorios para despacho a provincia. | `R-K08` |
| `GET` | `/api/comercial/pedidos/:pedidoId/datos-envio` | Consulta los datos de rotulado y agencia de envío del pedido. | `R-K08` |
| `PATCH` | `/api/comercial/pedidos/:pedidoId/datos-envio` | Actualiza datos de envío antes del despacho. | `R-K08` |
| `POST` | `/api/comercial/pedidos/:pedidoId/confirmacion` | Emite la confirmación comercial formal con desglose de recargos (`recargoTallas`, `recargoTelas`, `recargoCuellos`), adelanto sugerido al 50% y saldo. | `R-K06`, `R-K07`, `R-H07` |
| `GET` | `/api/comercial/pedidos/:pedidoId/confirmaciones` | Historial de versiones congeladas de confirmaciones comerciales emitidas. | `R-K06` |

---

### 3.6 Catálogos del Sistema
> **Módulo:** `1-nucleo-comercial/catalogos`  
> **Controladores:** `CatalogoController`, `TipoProductoController`  
> **Autenticación:** `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `GET` | `/api/catalogos/atributos` | Lista el catálogo de atributos del sistema (TELA, CUELLO, MANGA, CORTE, etc.) con sus marcas de obligatorio y crítico. | `R-B05`, `R-B06`, `R-C08` |
| `GET` | `/api/catalogos/atributos/:atributoId/valores` | Lista los valores permitidos para un atributo (ej. "Cuello V", "Cuello Redondo"). | `R-B05` |
| `GET` | `/api/catalogos/ubicaciones-personalizacion` | Lista el catálogo cerrado de ubicaciones de estampado (Pecho, Espalda, Mangas). | `R-F02` |
| `GET` | `/api/tipos-producto` | Lista los tipos de productos habilitados (Camisetas, Conjuntos, Shorts, Poleras). | `R-B01` |

---

### 3.7 Autenticación y Control de Usuarios
> **Módulo:** `1-nucleo-comercial/auth`  
> **Controlador:** `AuthController`  
> **Autenticación:** Pública (`login`) / Resto protegido con `@UseGuards(AuthGuard('jwt'))`

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `POST` | `/api/auth/login` | Inicia sesión con email y contraseña, retornando el Bearer Token JWT y datos del usuario con su rol. | `R-J01` |
| `POST` | `/api/auth/register` | Registra un nuevo usuario en la plataforma asignando su rol oficial (`ADMIN`, `DISENO`, `PRODUCCION`, `VENDEDORA`, etc.). | `R-J01` |
| `GET` | `/api/auth/profile` | Retorna los datos del usuario autenticado en la sesión actual. | `R-J01` |
| `GET` | `/api/auth/users` | Lista todos los usuarios del sistema con filtro opcional por rol. | `R-J01` |
| `GET` | `/api/auth/users/:id` | Detalle de un usuario específico. | `R-J01` |
| `PATCH` | `/api/auth/users/:id` | Modifica datos o rol de un usuario. | `R-J01` |
| `PUT` | `/api/auth/change-password` | Permite al usuario autenticado cambiar su contraseña actual. | `R-J01` |
| `DELETE` | `/api/auth/users/:id` | Desactiva a un usuario del sistema. | `R-J01` |

---

## 🟣 SECCIÓN 4: CORE INFRAESTRUCTURA — ALMACENAMIENTO (`core/storage`)

### 4.1 Supabase Storage: Subida y Gestión de Archivos Físicos
> **Módulo:** `core/storage`  
> **Controlador:** `StorageController`  
> **Autenticación:** JWT para subida y borrado / Público para healthcheck

| Método | Endpoint | Descripción | Reglas |
|---|---|---|---|
| `GET` | `/api/archivos/estado` | Verifica si Supabase Storage está activo y configurado con credenciales en el servidor. | Infra |
| `POST` | `/api/archivos/subir` | Sube un archivo o imagen (`multipart/form-data`) a Supabase Storage y retorna su URL pública inmutable (soporta query `?carpeta=disenos\|mockups\|tifs`). | `R-H11`, `R-K13` |
| `DELETE` | `/api/archivos` | Elimina un archivo físico almacenado en Supabase Storage mediante su path (`?path=carpeta/archivo.ext`). | Infra |

