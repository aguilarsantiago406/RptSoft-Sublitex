# ENDPOINTS OPERATIVOS BK1 — SUBLITEX SIPES
# Versión alineada: 2026-09-17
# Base URL: http://localhost:3001

---

## MÓDULO CLIENTES (/api/clientes)

### POST /api/clientes — Crear Cliente
Request Body:
```json
{
  "nombre": "Colegio San Agustin - Promo 2026",
  "tipo": "PROMOCION",
  "telefono": "999888777",
  "ciudad": "Lima"
}
```
Campos:
- nombre (string, REQUERIDO)
- tipo (enum, REQUERIDO): COLEGIO | PROMOCION | CLUB | EMPRESA | PARTICULAR
- telefono (string, opcional)
- ciudad (string, opcional)

Response 201: { id, tipo, nombre, telefono, ciudad, activo, creadoEn, actualizadoEn }
Response 400: Validación fallida

---

### GET /api/clientes — Listar Clientes
Query params opcionales: ?q=texto (busca en nombre y ciudad)
Response 200: Array de clientes

---

### GET /api/clientes/:id — Obtener Cliente
Response 200: Cliente con sus pedidos
Response 404: "Cliente no encontrado: :id"

---

## MÓDULO PEDIDOS (/api/pedidos)

### POST /api/pedidos — Crear Pedido
Request Body:
```json
{
  "clienteId": "cuid_real_del_cliente",
  "fechaCompromiso": "2026-11-20T00:00:00.000Z",
  "observaciones": "Entrega para desfile escolar"
}
```
Campos:
- clienteId (string CUID, REQUERIDO) — debe existir en la BD
- fechaCompromiso (ISO 8601, REQUERIDO)
- observaciones (string, opcional)

Response 201: Pedido con código autogenerado SUB-XXXX, estado BORRADOR
Response 404: "Cliente no encontrado: :clienteId"

---

### GET /api/pedidos — Listar Pedidos
Query params opcionales:
- ?estado=BORRADOR (filtra por EstadoPedido)
- ?clienteId=cuid_cliente
Response 200: Array de pedidos con datos del cliente

---

### GET /api/pedidos/:id — Detalle Completo
Response 200: Pedido + cliente + colores + grupos (con tipoProducto)
Response 404: Si no existe

---

### PATCH /api/pedidos/:id/estado — Cambiar Estado
⚠️ Método PATCH (no PUT, no GET)
Request Body:
```json
{
  "estado": "EN_CONFIGURACION",
  "motivo": "Aprobación inicial de ficha técnica"
}
```
Campos:
- estado (enum, REQUERIDO): BORRADOR | EN_CONFIGURACION | EN_RECOLECCION |
  EN_REVISION | EN_PRODUCCION | ENTREGADO | CERRADO | CANCELADO
- motivo (string, OPCIONAL)

Response 200: Pedido con nuevo estado
Response 404: Si pedido no existe

---

## MÓDULO COLORES (/api/pedidos/:id/colores)

### POST /api/pedidos/:pedidoId/colores — Agregar Colores
Acepta un objeto individual o un arreglo no vacío de colores.
Request Body:
```json
{
  "nombre": "Azul Marino",
  "codigoHex": "#000080",
  "referenciaFisica": "Pantone 287C"
}
```
Campos:
- nombre (string, REQUERIDO)
- codigoHex (string, REQUERIDO): formato estricto #RRGGBB (regex: /^#([0-9A-Fa-f]{6})$/)
- referenciaFisica (string, opcional)

Response 201: Color guardado
Response 400: HEX inválido o campos faltantes
Cuando se envía un arreglo, todos los elementos se validan antes de persistirlos.

---

### GET /api/pedidos/:pedidoId/colores — Listar Colores
Response 200: Array de colores del pedido

---

### DELETE /api/pedidos/:pedidoId/colores/:colorId — Eliminar Color
Response 200: Confirmación
Response 404: Si colorId no existe en ese pedido

---

## MÓDULO GRUPOS (/api/pedidos/:id/grupos y /api/grupos/:id)

### POST /api/pedidos/:pedidoId/grupos — Crear Grupo
⚠️ Ruta anidada bajo el pedido (no es /api/grupos directo)
⚠️ tipoProductoId DEBE existir en la tabla TipoProducto (seed requerido)
Request Body:
```json
{
  "nombre": "Conjunto Titular Alumnos",
  "politicaNumeracion": "LIBRE",
  "tipoProductoId": "cuid_real_del_tipo_producto",
  "cantidadContratada": 28,
  "observaciones": "Con escudo al frente"
}
```
Campos:
- nombre (string, REQUERIDO)
- politicaNumeracion (enum, REQUERIDO): LIBRE | UNICA
  ⚠️ CORRELATIVO NO EXISTE — causa error 500
- tipoProductoId (string CUID, REQUERIDO) — FK hacia TipoProducto
- cantidadContratada (entero >= 1, REQUERIDO) — R-B02
- observaciones (string, opcional)

Response 201: Grupo creado
Response 404: Si pedidoId no existe
Restricción BD: Nombre único por pedido (@@unique([pedidoId, nombre]))

---

### GET /api/pedidos/:pedidoId/grupos — Listar Grupos del Pedido
Response 200: Array de grupos con su tipoProducto incluido

---

### PUT /api/grupos/:id — Actualizar Grupo
Request Body: Cualquier campo parcial de CreateGrupoDto
Response 200: Grupo actualizado
Response 404: Si grupoId no existe

### GET /api/grupos/:id — Obtener Grupo
Response 200: Grupo con tipoProducto, componentes, configuración y conteo de prendas
Response 404: Si grupoId no existe

### PATCH /api/grupos/:id/politica — Cambiar Política
Request Body: `{ "politicaNumeracion": "LIBRE" | "UNICA" }`
Response 200: Grupo actualizado

### DELETE /api/grupos/:id — Eliminar Grupo
Solo procede si no tiene participantes ni prendas.
Response 409: Si el grupo tiene información dependiente

## MÓDULO CATÁLOGOS

### GET /api/tipos-producto — Listar Tipos de Producto
Response 200: Tipos de producto con componentes físicos BOM.

### GET /api/catalogos/tipos-producto — Alias de catálogo
Response 200: Misma respuesta que `/api/tipos-producto`.

### GET /api/catalogos/tallas
Query param opcional: `?tipoProductoId=...`
Response 200: Tallas activas, ordenadas por catálogo.

### GET /api/catalogos/atributos
Response 200: Atributos y valores disponibles para configurar grupos.

### GET /api/catalogos/ubicaciones
Response 200: Ubicaciones de personalización disponibles para BK2.

## MÓDULO RESUMEN DE PRODUCCIÓN

### GET /api/pedidos/:id/resumen-produccion
Calcula prendas registradas, faltantes, sobrantes, piezas físicas BOM y totales
por grupo. Las prendas `OBSEQUIO` y `MUESTRA` se fabrican, pero no se cobran.

### POST /api/pedidos/:id/resumen-produccion
Alias operativo para recalcular el mismo resumen sin recibir totales manuales.


---

## MÓDULO AUTENTICACIÓN (/api/auth)

### POST /api/auth/login — Iniciar Sesión (Obtener JWT)
Público (no requiere token previo).
Request Body:
```json
{
  "email": "admin@sublitex.com",
  "password": "password123"
}
```
Campos:
- email (string email, REQUERIDO)
- password (string, REQUERIDO)

Response 200:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "cuid_o_uuid_del_usuario",
    "email": "admin@sublitex.com",
    "nombre": "Administrador",
    "rol": "ADMINISTRADOR"
  }
}
```
Response 401: Credenciales inválidas

---

### POST /api/auth/register — Registrar Usuario
Requiere Header: `Authorization: Bearer <JWT>`
Request Body:
```json
{
  "email": "vendedor@sublitex.com",
  "password": "passwordSegura123",
  "nombre": "Juan Vendedor",
  "rol": "VENDEDORA"
}
```
Campos:
- email (string email, REQUERIDO) — debe ser único en la BD
- password (string, REQUERIDO) — mínimo 6 caracteres
- nombre (string, REQUERIDO)
- rol (enum RolUsuario, REQUERIDO): ADMINISTRADOR | COORDINADOR_OPERATIVO | VENDEDORA | COORDINADOR_CLIENTE | DISENO | PRODUCCION

Response 201: Usuario creado sin password en respuesta
Response 409: Si el email ya existe

---

### GET /api/auth/me — Perfil de Usuario Autenticado
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Datos del usuario autenticado (id, email, nombre, rol, activo)

---

### GET /api/auth — Listar Usuarios
Requiere Header: `Authorization: Bearer <JWT>`
Query params opcionales:
- `?rol=VENDEDORA` (filtra por RolUsuario)

Response 200: Array de usuarios registrados (sin password)

---

### GET /api/auth/:id — Obtener Usuario por ID
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Datos del usuario
Response 404: Usuario no encontrado

---

### PATCH /api/auth/:id — Actualizar Usuario
Requiere Header: `Authorization: Bearer <JWT>`
Request Body:
```json
{
  "nombre": "Juan Carlos Vendedor",
  "rol": "COORDINADOR_OPERATIVO",
  "activo": true
}
```
Campos (todos opcionales):
- nombre (string, opcional)
- rol (enum RolUsuario, opcional)
- activo (boolean, opcional)

Response 200: Usuario actualizado
Response 404: Si el usuario no existe

---

### PATCH /api/auth/:id/password — Cambiar Contraseña
Requiere Header: `Authorization: Bearer <JWT>`
Request Body:
```json
{
  "currentPassword": "passwordAnterior123",
  "newPassword": "nuevaPassword456"
}
```
Campos:
- currentPassword (string, REQUERIDO)
- newPassword (string, REQUERIDO) — mínimo 6 caracteres

Response 200: Confirmación de actualización
Response 401: Contraseña actual incorrecta
Response 404: Usuario no existe

---

### DELETE /api/auth/:id — Eliminar Usuario
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Confirmación de eliminación
Response 404: Usuario no existe

---

## MÓDULO COMERCIAL (/api/comercial)

### POST /api/comercial/tarifas — Crear Tarifa (R-K10)
Requiere Header: `Authorization: Bearer <JWT>`
Request Body:
```json
{
  "tipo": "PRODUCTO",
  "concepto": "Camiseta Deportiva Titular",
  "valor": 45.00,
  "vigenteDesde": "2026-01-01T00:00:00.000Z",
  "vigenteHasta": "2026-12-31T23:59:59.000Z",
  "nota": "Tarifa base institucional 2026"
}
```
Campos:
- tipo (enum TipoTarifa, REQUERIDO): PRODUCTO | RECARGO_TALLA | RECARGO_TELA | RECARGO_CUELLO | RECARGO_ACABADO | ADICIONAL | COSTO_INTERNO
- concepto (string, REQUERIDO)
- valor (número positivo, REQUERIDO)
- vigenteDesde (ISO 8601, REQUERIDO)
- vigenteHasta (ISO 8601, opcional)
- nota (string, opcional)

Response 201: Tarifa creada con ID
Response 409: Conflicto si ya existe tarifa con mismo tipo, concepto y fecha vigenteDesde

---

### GET /api/comercial/tarifas — Listar Todas las Tarifas
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Array con todas las tarifas históricas y activas

---

### GET /api/comercial/tarifas/vigentes — Listar Tarifas Vigentes
Requiere Header: `Authorization: Bearer <JWT>`
Filtra automáticamente tarifas con `vigenteDesde <= AHORA` y (`vigenteHasta >= AHORA` o `null`).
Query params opcionales:
- `?tipo=PRODUCTO` (filtra por TipoTarifa)

Response 200: Array de tarifas vigentes

---

### GET /api/comercial/tarifas/:id — Obtener Tarifa por ID
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Detalle de la tarifa
Response 404: Tarifa no encontrada

---

### PATCH /api/comercial/tarifas/:id — Actualizar Tarifa
Requiere Header: `Authorization: Bearer <JWT>`
Request Body: Campos parciales de CreateTarifaDto
Response 200: Tarifa actualizada
Response 404: Tarifa no encontrada

---

### DELETE /api/comercial/tarifas/:id — Eliminar Tarifa
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Confirmación de eliminación
Response 404: Tarifa no encontrada

---

### POST /api/comercial/pedidos/:pedidoId/envio — Registrar Datos de Envío (R-K08)
Requiere Header: `Authorization: Bearer <JWT>`
Request Body:
```json
{
  "nombreCompleto": "Carlos Mendoza Quispe",
  "dni": "45892314",
  "celular": "+51987654321",
  "ciudad": "Arequipa",
  "agencia": "Shalom",
  "referencia": "Frente al terminal terrestre",
  "correo": "carlos.mendoza@gmail.com"
}
```
Campos:
- nombreCompleto (string, REQUERIDO)
- dni (string, REQUERIDO)
- celular (string, REQUERIDO)
- ciudad (string, REQUERIDO)
- agencia (string, REQUERIDO)
- referencia (string, opcional)
- correo (string email, opcional)

Response 201: Datos de envío registrados
Response 404: Si pedidoId no existe
Response 409: Si el pedido ya tiene datos de envío registrados

---

### GET /api/comercial/pedidos/:pedidoId/envio — Obtener Datos de Envío
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Datos de envío asociados al pedido
Response 404: Si no existen datos de envío para ese pedido

---

### PATCH /api/comercial/pedidos/:pedidoId/envio — Actualizar Datos de Envío
Requiere Header: `Authorization: Bearer <JWT>`
Request Body: Campos parciales de CreateDatosEnvioDto
Response 200: Datos de envío actualizados
Response 404: Si no existen datos de envío para ese pedido

---

### DELETE /api/comercial/pedidos/:pedidoId/envio — Eliminar Datos de Envío
Requiere Header: `Authorization: Bearer <JWT>`
Response 200: Confirmación de eliminación
Response 404: Si no existen datos de envío para ese pedido
