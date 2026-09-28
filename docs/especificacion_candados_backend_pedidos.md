# Especificación Técnica: Candados de Dominio en Transición de Estados
**Módulo:** `1-nucleo-comercial` / `pedidos`  
**Endpoint afectado:** `PATCH /api/pedidos/:id/estado`  
**Servicio:** [`pedido.service.ts`](file:///C:/Users/juanp/Desktop/Nueva%20carpeta%20%282%29/RptSoft-Sublitex/backend/src/modules/1-nucleo-comercial/pedidos/pedido.service.ts)  
**Fecha:** 26 de Septiembre de 2026  
**Estado:** Propuesta de Arquitectura Backend

---

## 1. Diagnóstico del Problema Actual

Actualmente, el método `updateEstado` de `PedidoService` únicamente valida:
1. La existencia de la arista en la matriz de adyacencia de estados (`transicionValida`).
2. La existencia de `fechaCompromiso` únicamente si el estado de origen es `BORRADOR`.

```typescript
// backend/src/modules/1-nucleo-comercial/pedidos/pedido.service.ts
async updateEstado(id: string, dto: UpdateEstadoDto) {
  const pedido = await this.findOne(id);
  const actual = pedido.estado as EstadoPedido;
  const destino = dto.estado;

  if (!transicionValida(actual, destino)) {
    throw new BadRequestException(`Transición inválida de ${actual} a ${destino} (R-A06)`);
  }
  // Única validación de dominio existente:
  if (actual === EstadoPedido.BORRADOR && destino !== EstadoPedido.CANCELADO) {
    if (!pedido.fechaCompromiso) {
      throw new BadRequestException('La fecha de compromiso es obligatoria para salir de BORRADOR (R-A09)');
    }
  }

  // Se persiste directamente en BD:
  return this.prisma.pedido.update({
    where: { id },
    data: { estado: destino },
  });
}
```

### Consecuencia Crítica
Cualquier llamada HTTP directa o cliente frontend puede transicionar un pedido hasta `CERRADO` sin grupos textiles, sin prendas registradas, sin diseño aprobado y sin dirección de entrega.

---

## 2. Matriz de Invariantes y Candados de Dominio

Para garantizar la integridad operativa de Sublitex, cada transición debe evaluar sus condiciones obligatorias antes de permitir el cambio en base de datos:

| Transición | Candado / Invariante | Regla de Negocio | Excepción si falla |
|---|---|---|---|
| `BORRADOR` → `EN_CONFIGURACION` | Cliente asignado y `fechaCompromiso > fechaPedido` | R-A09 | `400 Bad Request` |
| `EN_CONFIGURACION` → `EN_RECOLECCION` | Al menos 1 grupo de prendas creado (`grupos.length > 0`) | R-B02 | `400 Bad Request` |
| `EN_CONFIGURACION` → `EN_RECOLECCION` | Mínimo 12 prendas contratadas en total (`totalContratado >= 12`) | R-K09 | `400 Bad Request` |
| `EN_CONFIGURACION` → `EN_RECOLECCION` | Al menos 1 color oficial registrado con formato HEX `#RRGGBB` | R-K05 | `400 Bad Request` |
| `EN_RECOLECCION` → `EN_REVISION` | Al menos 1 prenda registrada con talla o participante cargado | Operación | `400 Bad Request` |
| `EN_REVISION` → `EN_PRODUCCION` | **Candado 1: Diseño aprobado.** Debe existir al menos un diseño con `estado === 'APROBADO'` o bloque `DISENO` cerrado. | R-H01, R-H12 | `400 Bad Request` |
| `EN_REVISION` → `EN_PRODUCCION` | **Candado 2: Lista cerrada al 100%.** Todas las prendas contratadas deben tener talla asignada (`prendasFaltantes === 0`). | R-B02, R-H03 | `400 Bad Request` |
| `EN_REVISION` → `EN_PRODUCCION` | **Candado 3: Despacho.** Datos de envío configurados (`ciudad` o `direccion` o `agencia`). | R-A05 | `400 Bad Request` |
| `EN_PRODUCCION` → `ENTREGADO` | La producción debe estar terminada (lote confeccionado y empacado). | Operación | `400 Bad Request` |
| `ENTREGADO` → `CERRADO` | Cobranza y conciliación comercial completada al 100%. | R-H03 | `400 Bad Request` |

### 2.1 Equivalencia Arquitectónica: Los "3 Candados" son los 3 Bloques de la Regla R-H01 (`TipoBloque`)

En el modelo de dominio de Sublitex, un pedido no es un formulario monolítico, sino tres áreas de trabajo concurrentes e independientes representadas en la entidad `BloquePedido` con el enum `TipoBloque`:

```prisma
enum TipoBloque {
  DISENO
  LISTA
  COMERCIAL
}

enum EstadoBloque {
  ABIERTO
  EN_REVISION
  CERRADO
}
```

Cada uno de estos tres bloques avanza a su propio ritmo y posee su propio ciclo de vida. La expresión **"los 3 candados de producción"** se refiere formalmente al momento en que cada bloque alcanza el estado `CERRADO`:
1. **Candado 1 = Bloque `DISENO` cerrado:** Arte vectorial aprobado formalmente por el cliente (Reglas R-H01, R-H12). El taller tiene el arte definitivo.
2. **Candado 2 = Bloque `LISTA` cerrado:** 100% de prendas registradas con talla, dorsal y excepciones (Reglas R-B02, R-H03). El taller sabe exactamente qué tallas cortar.
3. **Candado 3 = Bloque `COMERCIAL` cerrado:** Confirmación comercial congelada, 50% de anticipo pagado y datos de despacho confirmados (Reglas R-A05, R-K06, R-K07). Sublitex tiene la garantía económica para comprar tela e insumos.

El pase de `EN_REVISION` a `EN_PRODUCCION` es el único punto de convergencia donde el sistema **debe verificar que los 3 bloques estén en `CERRADO`**. Si alguno sigue `ABIERTO`, la orden no puede entrar a corte.

---

## 3. Arquitectura Propuesta para Backend

Se recomienda desacoplar la validación de transiciones en un validador especializado o patrón *State Guard* dentro del módulo de pedidos:

```
backend/src/modules/1-nucleo-comercial/pedidos/
├── estado-pedido.transitions.ts     (Grafo de adyacencia)
├── estado-pedido.validator.ts       (NUEVO: Candados de dominio por transición)
├── pedido.service.ts                (Orquestación limpia)
```

### Implementación sugerida de `EstadoPedidoValidator`:

```typescript
// backend/src/modules/1-nucleo-comercial/pedidos/estado-pedido.validator.ts
import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EstadoPedido } from './estado-pedido.enum';

export class EstadoPedidoValidator {
  constructor(private readonly prisma: PrismaService) {}

  async validarTransicion(pedidoId: string, actual: EstadoPedido, destino: EstadoPedido): Promise<void> {
    if (destino === EstadoPedido.CANCELADO) return;

    switch (destino) {
      case EstadoPedido.EN_CONFIGURACION:
        await this.validarSalidaBorrador(pedidoId);
        break;

      case EstadoPedido.EN_RECOLECCION:
        await this.validarConfiguracionTextil(pedidoId);
        break;

      case EstadoPedido.EN_REVISION:
        await this.validarRecoleccionIniciada(pedidoId);
        break;

      case EstadoPedido.EN_PRODUCCION:
        await this.validarPaseAProduccion(pedidoId);
        break;

      case EstadoPedido.CERRADO:
        await this.validarCierrePedido(pedidoId);
        break;
    }
  }

  private async validarSalidaBorrador(pedidoId: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { fechaCompromiso: true, fechaPedido: true, clienteId: true },
    });
    if (!pedido?.fechaCompromiso || new Date(pedido.fechaCompromiso) <= new Date(pedido.fechaPedido)) {
      throw new BadRequestException('La fecha de compromiso es obligatoria y debe ser posterior al pedido (R-A09).');
    }
  }

  private async validarConfiguracionTextil(pedidoId: string) {
    const [grupos, colores] = await Promise.all([
      this.prisma.grupoPedido.findMany({ where: { pedidoId } }),
      this.prisma.colorPedido.findMany({ where: { pedidoId } }),
    ]);

    if (grupos.length === 0) {
      throw new BadRequestException('Debe registrar al menos un grupo de prendas antes de iniciar recolección (R-B02).');
    }

    const totalContratado = grupos.reduce((acc, g) => acc + g.cantidadContratada, 0);
    if (totalContratado < 12) {
      throw new BadRequestException(`El pedido no cumple el mínimo de 12 unidades (actual: ${totalContratado}) (R-K09).`);
    }

    if (colores.length === 0) {
      throw new BadRequestException('Debe registrar al menos un color oficial para el pedido (R-K05).');
    }
  }

  private async validarRecoleccionIniciada(pedidoId: string) {
    const prendasContador = await this.prisma.prenda.count({
      where: { grupo: { pedidoId } },
    });
    if (prendasContador === 0) {
      throw new BadRequestException('No se puede pasar a Revisión sin prendas ni participantes registrados.');
    }
  }

  private async validarPaseAProduccion(pedidoId: string) {
    // 1. Candado R-H01: Diseño Aprobado
    const disenoAprobado = await this.prisma.diseno.findFirst({
      where: { pedidoId, estado: 'APROBADO' },
    });
    if (!disenoAprobado) {
      throw new BadRequestException('Candado R-H01: El pedido requiere al menos un diseño aprobado formalmente.');
    }

    // 2. Candado R-B02 / R-H03: Lista 100% Completa
    const grupos = await this.prisma.grupoPedido.findMany({
      where: { pedidoId },
      include: { prendas: { select: { id: true, tallaId: true } } },
    });

    for (const g of grupos) {
      const prendasValidas = g.prendas.filter((p) => Boolean(p.tallaId)).length;
      if (prendasValidas < g.cantidadContratada) {
        throw new BadRequestException(
          `Grupo "${g.nombre}": faltan ${g.cantidadContratada - prendasValidas} prendas con talla asignada.`
        );
      }
    }

    // 3. Candado R-A05: Datos de Envío
    const envio = await this.prisma.datosEnvio.findUnique({
      where: { pedidoId },
    });
    if (!envio || (!envio.ciudad && !envio.direccion && !envio.agencia)) {
      throw new BadRequestException('Candado R-A05: Debe registrar los datos de despacho y entrega del pedido.');
    }
  }

  private async validarCierrePedido(pedidoId: string) {
    // Validar estado de entrega y liquidación comercial según reglas contables
  }
}
```

---

## 4. Plan de Adopción

1. **Crear archivo de validación:** Implementar `EstadoPedidoValidator` en `backend/src/modules/1-nucleo-comercial/pedidos/`.
2. **Inyectar en `PedidoService`:** Invocar `validarTransicion(id, actual, destino)` dentro de `updateEstado` previo al `prisma.pedido.update`.
3. **Pruebas Unitarias:** Crear `estado-pedido.validator.spec.ts` probando cada caso borde (0 grupos, 0 prendas, diseño en borrador, etc.).
4. **Respuesta Frontend:** La UI de Next.js ya captura `res.error` y muestra los mensajes del backend en pantalla, por lo que el usuario recibirá la retroalimentación inmediata del candado que no cumplió.

---

## 5. Bloqueo de Visibilidad de Vendedoras en Creación y Edición de Pedidos

**Módulo:** `1-nucleo-comercial` / `auth`  
**Endpoint afectado:** `GET /api/auth`  
**Controlador:** [`auth.controller.ts`](file:///C:/Users/juanp/Desktop/Nueva%20carpeta%20%282%29/RptSoft-Sublitex/Backend/src/modules/1-nucleo-comercial/auth/auth.controller.ts)  
**Severidad:** Alta (Impide asignación operativa de pedidos por vendedoras)

### 5.1 Diagnóstico del Problema
Al crear un pedido (`POST /api/pedidos`) o editar su cabecera (`PATCH /api/pedidos/:id`), los roles comerciales (`VENDEDORA`, `VENDEDOR`, `COORDINADOR_OPERATIVO`) tienen autorización para operar sobre el pedido, pero necesitan poblar el selector de `vendedoraId`.

El frontend consulta `GET /api/auth` (o `GET /api/auth?rol=VENDEDORA`) para listar a las vendedoras activas registradas en el sistema. Sin embargo, en `auth.controller.ts`:

```typescript
// Backend/src/modules/1-nucleo-comercial/auth/auth.controller.ts
function requireAdmin(user: { rol: RolUsuario }) {
  if (user.rol !== RolUsuario.ADMINISTRADOR) {
    throw new ForbiddenException('Solo los administradores pueden realizar esta accion');
  }
}

@Get()
@ApiOperation({ summary: 'Listar usuarios (solo ADMINISTRADOR)' })
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
findAll(@Query('rol') rol: string | undefined, @Request() req: { user: { rol: RolUsuario } }) {
  requireAdmin(req.user); // <-- 403 Forbidden para cualquier rol que no sea ADMINISTRADOR
  return this.authService.findAll(rol);
}
```

### 5.2 Consecuencia en Operación
Cuando un usuario con rol `VENDEDORA` inicia sesión y entra a `/pedidos` o `/pedidos/:id`, la llamada a `GET /api/auth` devuelve `403 Forbidden`. En consecuencia:
1. El selector de vendedoras en el modal queda completamente vacío.
2. La vendedora no puede asignarse a sí misma ni asignar a otra vendedora al pedido.

### 5.3 Solución Propuesta para Backend
Existen dos alternativas limpias de diseño:

#### Opción A (Recomendada y de mínimo impacto):
Permitir a roles comerciales consultar usuarios con filtro de rol o relajar el guard para lectura:
```typescript
@Get()
@ApiOperation({ summary: 'Listar usuarios (ADMINISTRADOR y roles comerciales)' })
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
findAll(@Query('rol') rol: string | undefined, @Request() req: { user: { rol: RolUsuario } }) {
  const ROLES_PERMITIDOS = [
    RolUsuario.ADMINISTRADOR,
    RolUsuario.COORDINADOR_OPERATIVO,
    RolUsuario.VENDEDOR,
    RolUsuario.VENDEDORA,
  ];
  if (!ROLES_PERMITIDOS.includes(req.user.rol)) {
    throw new ForbiddenException('No tienes permiso para consultar el directorio de usuarios');
  }
  return this.authService.findAll(rol);
}
```

#### Opción B (Directorio comercial dedicado en catálogos):
Exponer una ruta pública autenticada de proyección limitada (`id`, `nombre`, `rol`) en el módulo de catálogos:
- `GET /api/catalogos/vendedoras` disponible para cualquier usuario con JWT válido.

---

## 6. Requerimiento Técnico: Descarga HTTP de Confirmación en PDF

**Módulo:** `1-nucleo-comercial` / `comercial`  
**Servicio:** [`pdf.service.ts`](file:///C:/Users/juanp/Desktop/Nueva%20carpeta%20%282%29/RptSoft-Sublitex/Backend/src/core/pdf/pdf.service.ts) y [`comercial.service.ts`](file:///C:/Users/juanp/Desktop/Nueva%20carpeta%20%282%29/RptSoft-Sublitex/Backend/src/modules/1-nucleo-comercial/comercial/comercial.service.ts)  
**Severidad:** Media (Bloqueo de descarga de documento comercial desde el cliente)

### 6.1 Situación Actual
Al invocar `POST /api/pedidos/:id/confirmaciones`, `PdfService` genera el archivo en disco (`storage/confirmaciones/${codigo}-v${version}.pdf`) y guarda la fila con `pdfUrl: "/storage/confirmaciones/SUB-XXXX-v1.pdf"`.
Sin embargo:
- La carpeta `storage/` no está expuesta como assets estáticos en NestJS (`app.useStaticAssets`).
- No existe un endpoint que haga `res.download()` o retorne un `StreamableFile`.
- Intentar acceder a la ruta `http://localhost:3001/storage/confirmaciones/...` arroja `404 Cannot GET`.

### 6.2 Solución Propuesta para Backend
Agregar un endpoint de descarga autenticado con `StreamableFile`:
```typescript
@Get(':id/confirmaciones/:version/pdf')
@ApiOperation({ summary: 'Descargar archivo PDF de confirmación de pedido' })
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
async descargarPdf(
  @Param('id') pedidoId: string,
  @Param('version', ParseIntPipe) version: number,
  @Res({ passthrough: true }) res: Response,
): Promise<StreamableFile> {
  const filePath = await this.comercialService.obtenerRutaPdf(pedidoId, version);
  const file = createReadStream(filePath);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="confirmacion-v${version}.pdf"`,
  });
  return new StreamableFile(file);
}
```

---

## 7. Matriz de Autorización y Roles (RBAC) en `PATCH /api/pedidos/:id/estado`

**Módulo:** `1-nucleo-comercial` / `pedidos`  
**Endpoint:** `PATCH /api/pedidos/:id/estado`  
**Controlador:** [`pedido.controller.ts`](file:///C:/Users/juanp/Desktop/Nueva%20carpeta%20%282%29/RptSoft-Sublitex/backend/src/modules/1-nucleo-comercial/pedidos/pedido.controller.ts#L113)  
**Severidad:** Crítica (Bloquea la operación comercial de las vendedoras con 403 Forbidden)

### 7.1 Diagnóstico del Problema
En `pedido.controller.ts`, el endpoint de transición de estado está decorado exclusivamente con roles de producción:

```typescript
const PRODUCCION_ROLES = [RolUsuario.ADMINISTRADOR, RolUsuario.PRODUCCION];

@Patch(':id/estado')
@Roles(...PRODUCCION_ROLES) // <-- Excluye VENDEDORA, VENDEDOR y COORDINADOR_OPERATIVO
@ApiOperation({ summary: 'Cambiar estado del pedido - requiere rol PRODUCCION o ADMINISTRADOR' })
updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
  return this.pedidoService.updateEstado(id, dto);
}
```

Cuando un usuario autenticado con rol `VENDEDORA` (como `laura.mendez@sublitex.com`) intenta avanzar un pedido en las fases comerciales (`BORRADOR -> EN_CONFIGURACION -> EN_RECOLECCION -> EN_REVISION`), el guard `RolesGuard` de NestJS rechaza la solicitud de inmediato con:

```json
{
  "statusCode": 403,
  "message": "Rol sin permiso para cambiar estado de produccion",
  "error": "Forbidden"
}
```

### 7.2 Defecto de Diseño Arquitectónico
Se asumió incorrectamente que *toda* transición de estado de un pedido es una acción de taller. Sin embargo, en el modelo de negocio de Sublitex:
* Las fases **`BORRADOR` → `EN_CONFIGURACION` → `EN_RECOLECCION` → `EN_REVISION`** son **100% de naturaleza comercial**: son ejecutadas por la **Vendedora** o el **Coordinador** mientras gestionan al cliente, las telas, los colores y las tallas.
* El pase a **`EN_PRODUCCION`** es una decisión de fábrica/operaciones: debe ser ejecutado por **`COORDINADOR_OPERATIVO`**, **`PRODUCCION`** o **`ADMINISTRADOR`**, habiendo verificado previamente que los **3 Bloques (`DISENO`, `LISTA`, `COMERCIAL`) estén en estado `CERRADO`**.
* La transición a **`ENTREGADO`** corresponde a **`PRODUCCION`** o **`ADMINISTRADOR`**.
* La transición a **`CERRADO`** corresponde a **`ADMINISTRADOR`** o **`COORDINADOR_OPERATIVO`** tras liquidar el saldo del pedido.

### 7.3 Solución Recomendada para Backend
Reemplazar la restricción rígida de `@Roles(...PRODUCCION_ROLES)` por una validación de autorización granular por transición dentro del servicio o un guard específico:

```typescript
// backend/src/modules/1-nucleo-comercial/pedidos/pedido.controller.ts
const ROLES_GESTION_PEDIDOS = [
  RolUsuario.ADMINISTRADOR,
  RolUsuario.COORDINADOR_OPERATIVO,
  RolUsuario.PRODUCCION,
  RolUsuario.VENDEDOR,
  RolUsuario.VENDEDORA,
];

@Patch(':id/estado')
@Roles(...ROLES_GESTION_PEDIDOS)
@ApiOperation({ summary: 'Cambiar estado del pedido con validación de RBAC por etapa' })
updateEstado(
  @Param('id') id: string,
  @Body() dto: UpdateEstadoDto,
  @Request() req: { user: { id: string; rol: RolUsuario } },
) {
  return this.pedidoService.updateEstado(id, dto, req.user.rol);
}
```

Y dentro de `pedido.service.ts`:

```typescript
validarPermisoRolTransicion(rol: RolUsuario, destino: EstadoPedido) {
  const transicionesComerciales = [
    EstadoPedido.EN_CONFIGURACION,
    EstadoPedido.EN_RECOLECCION,
    EstadoPedido.EN_REVISION,
  ];

  if (transicionesComerciales.includes(destino)) {
    // Vendedoras y coordinadores pueden avanzar libremente estas etapas
    return;
  }

  if (destino === EstadoPedido.EN_PRODUCCION || destino === EstadoPedido.ENTREGADO) {
    if (rol !== RolUsuario.ADMINISTRADOR && rol !== RolUsuario.PRODUCCION && rol !== RolUsuario.COORDINADOR_OPERATIVO) {
      throw new ForbiddenException('Solo Producción o Coordinación pueden liberar pedidos a fábrica.');
    }
  }

  if (destino === EstadoPedido.CERRADO) {
    if (rol !== RolUsuario.ADMINISTRADOR && rol !== RolUsuario.COORDINADOR_OPERATIVO) {
      throw new ForbiddenException('Solo Administración o Coordinación pueden cerrar formalmente un pedido.');
    }
  }
}
```


