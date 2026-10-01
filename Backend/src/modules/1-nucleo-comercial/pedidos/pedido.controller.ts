import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Request, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { UpdateEstadoDto, EstadoPedido } from './dto/update-estado.dto';
import { AddColorDto } from './dto/add-color.dto';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { ComercialService } from '../comercial/comercial.service';
import { EmitirConfirmacionDto } from '../comercial/dto/emitir-confirmacion.dto';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

const COMERCIAL = [RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.VENDEDORA, RolUsuario.COORDINADOR_OPERATIVO];
const COORDINACION = [RolUsuario.ADMINISTRADOR, RolUsuario.COORDINADOR_OPERATIVO, RolUsuario.COORDINADOR_CLIENTE];
const PRODUCCION_ROLES = [RolUsuario.ADMINISTRADOR, RolUsuario.PRODUCCION];
const TODOS = Object.values(RolUsuario) as RolUsuario[];

// Roles que pueden tocar el endpoint de estado (unión de todos los que participan
// en alguna transición). La validación fina por etapa se hace en el servicio.
const ESTADO_ROLES = [...new Set([...COMERCIAL, ...COORDINACION, ...PRODUCCION_ROLES])] as RolUsuario[];

@ApiTags('Pedidos')
@Controller('api/pedidos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class PedidoController {
  constructor(
    private readonly pedidoService: PedidoService,
    private readonly comercialService: ComercialService,
  ) {}

  @Post()
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Crear nuevo pedido - genera codigo SUB-XXXX' })
  @ApiResponse({ status: 201, description: 'Pedido creado en estado BORRADOR con codigo SUB-XXXX' })
  @ApiResponse({ status: 400, description: 'Datos invalidos o fecha compromiso anterior a hoy (R-A09)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para crear pedidos' })
  @ApiResponse({ status: 404, description: 'Cliente o Vendedora no encontrado' })
  create(@Body() dto: CreatePedidoDto, @Request() req: { user: { id: string } }) {
    return this.pedidoService.create(dto, req.user.id);
  }

  @Get()
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar pedidos con filtros opcionales' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoPedido, description: 'Filtrar por estado del pedido' })
  @ApiQuery({ name: 'clienteId', required: false, description: 'Filtrar por ID del cliente' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos con datos de cliente, vendedora y tiempoDias' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  findAll(@Query('estado') estado?: string, @Query('clienteId') clienteId?: string) {
    return this.pedidoService.findAll(estado, clienteId);
  }

  @Get(':id')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Detalle de pedido con grupos y colores' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido con cliente, vendedora, grupos y colores' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(@Param('id') id: string) {
    return this.pedidoService.findOne(id);
  }

  @Patch(':id')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Actualizar datos generales del pedido (fechaCompromiso, vendedoraId, observaciones)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Pedido actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Fecha de compromiso invalida (R-A09)' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para editar pedidos' })
  @ApiResponse({ status: 404, description: 'Pedido o vendedora no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.pedidoService.update(id, dto);
  }

  @Get(':id/resumen-produccion')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Resumen de produccion: cantidad contratada vs prendas registradas por grupo' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Resumen de produccion y conciliacion' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  resumenProduccion(@Param('id') id: string) {
    return this.pedidoService.resumenProduccion(id);
  }

  @Post(':id/resumen-produccion')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Alias operativo POST para recalcular resumen de produccion' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Resumen recalculado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  resumenProduccionPost(@Param('id') id: string) {
    return this.pedidoService.resumenProduccion(id);
  }

  @Get(':id/conciliacion-comercial')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Alias de resumen-produccion (R-B02, R-H03)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Conciliacion comercial calculada' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  conciliacionComercial(@Param('id') id: string) {
    return this.pedidoService.resumenProduccion(id);
  }

  @Patch(':id/estado')
  @Roles(...ESTADO_ROLES)
  @ApiOperation({
    summary: 'Cambiar estado del pedido (R-A06)',
    description:
      'Etapas comerciales (BORRADOR→EN_CONFIGURACION, EN_CONFIGURACION→EN_RECOLECCION): ' +
      'requiere VENDEDOR/VENDEDORA/COORDINADOR_OPERATIVO/ADMINISTRADOR. ' +
      'Etapa puente (EN_RECOLECCION→EN_REVISION): requiere COORDINADOR/ADMINISTRADOR. ' +
      'Etapas industriales (EN_REVISION→EN_PRODUCCION, entregas): requiere PRODUCCION/ADMINISTRADOR.',
  })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  @ApiResponse({ status: 400, description: 'Transicion de estado no permitida o condiciones no cumplidas' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para esta transicion de estado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  updateEstado(
    @Param('id') id: string,
    @Body() dto: UpdateEstadoDto,
    @Request() req: { user: { id: string; rol: RolUsuario } },
  ) {
    return this.pedidoService.updateEstado(id, dto, req.user.rol);
  }

  @Post(':id/colores')
  @Roles(...COMERCIAL, RolUsuario.DISENO)
  @ApiOperation({ summary: 'Agregar color oficial HEX (R-K05)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 201, description: 'Color(es) agregado(s) exitosamente' })
  @ApiResponse({ status: 400, description: 'Codigo Hex invalido (#RRGGBB) o datos incompletos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para agregar colores' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  addColor(@Param('id') id: string, @Body() dto: AddColorDto | AddColorDto[]) {
    if (!Array.isArray(dto)) {
      return this.pedidoService.addColor(id, dto);
    }
    if (dto.length === 0) {
      throw new BadRequestException('Debe enviar al menos un color');
    }

    const colores = dto.map((item) => plainToInstance(AddColorDto, item));
    const errores = colores.flatMap((color) => validateSync(color));
    if (errores.length > 0) {
      throw new BadRequestException(errores);
    }
    return this.pedidoService.addColors(id, colores);
  }

  @Get(':id/colores')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar colores del pedido' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Lista de colores oficiales del pedido' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  getColores(@Param('id') id: string) {
    return this.pedidoService.getColores(id);
  }

  @Delete(':id/colores/:colorId')
  @Roles(...COMERCIAL, RolUsuario.DISENO)
  @ApiOperation({ summary: 'Eliminar color del pedido' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiParam({ name: 'colorId', description: 'ID del color a eliminar' })
  @ApiResponse({ status: 200, description: 'Color eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para eliminar colores' })
  @ApiResponse({ status: 404, description: 'Pedido o color no encontrado' })
  deleteColor(@Param('id') id: string, @Param('colorId') colorId: string) {
    return this.pedidoService.deleteColor(id, colorId);
  }

  @Patch(':id/colores/:colorId')
  @Roles(...COMERCIAL, RolUsuario.DISENO)
  @ApiOperation({ summary: 'Actualizar color oficial y calibración CMYK de taller' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiParam({ name: 'colorId', description: 'ID del color a actualizar' })
  @ApiResponse({ status: 200, description: 'Color actualizado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido o color no encontrado' })
  updateColor(
    @Param('id') id: string,
    @Param('colorId') colorId: string,
    @Body() dto: Partial<AddColorDto>,
  ) {
    return this.pedidoService.updateColor(id, colorId, dto);
  }

  @Post(':id/confirmaciones')
  @Roles(...COORDINACION)
  @ApiOperation({ summary: 'Emitir confirmacion comercial congelada del pedido (R-H05, R-K06, R-K07)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 201, description: 'Confirmacion emitida exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Solo COORDINADOR puede emitir confirmaciones' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  emitirConfirmacion(
    @Param('id') id: string,
    @Body() dto: EmitirConfirmacionDto,
    @Request() req: { user?: { id: string } },
  ) {
    return this.comercialService.emitirConfirmacion(id, dto, req?.user?.id);
  }

  @Get(':id/confirmaciones')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar historial de confirmaciones de un pedido (R-K06)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Lista de confirmaciones ordenadas por version desc' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findConfirmaciones(@Param('id') id: string) {
    return this.comercialService.findConfirmaciones(id);
  }

  @Get(':id/export-diseno')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Exportar planilla de prendas para Diseño / Corel en CSV limpio ordenado por talla' })
  @ApiParam({ name: 'id', description: 'ID o código único del pedido' })
  @ApiResponse({ status: 200, description: 'Archivo CSV descargable con columnas Talla | Nombre en prenda | Número | Tipo prenda | Corte | Color' })
  async exportDiseno(@Param('id') id: string, @Res() res: Response) {
    const { filename, csvContent } = await this.pedidoService.exportDiseno(id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  }

  @Post(':id/bitacoras')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Registrar modificación o cambio de último momento en el pedido' })
  @ApiParam({ name: 'id', description: 'ID o código único del pedido' })
  @ApiResponse({ status: 201, description: 'Modificación registrada exitosamente' })
  createBitacora(@Param('id') id: string, @Body() dto: CreateBitacoraDto) {
    return this.pedidoService.crearBitacora(id, dto);
  }

  @Get(':id/bitacoras')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar bitácora de modificaciones de último momento del pedido' })
  @ApiParam({ name: 'id', description: 'ID o código único del pedido' })
  @ApiResponse({ status: 200, description: 'Historial de modificaciones del pedido' })
  getBitacoras(@Param('id') id: string) {
    return this.pedidoService.getBitacoras(id);
  }

  @Patch(':id/bitacoras/:bitacoraId/avisar')
  @Roles(...COORDINACION)
  @ApiOperation({ summary: 'Marcar o desmarcar si el cambio de último momento ya fue avisado a taller (Solo Coordinador/Admin)' })
  @ApiParam({ name: 'id', description: 'ID o código del pedido' })
  @ApiParam({ name: 'bitacoraId', description: 'ID del registro de bitácora' })
  @ApiResponse({ status: 200, description: 'Estado de aviso a taller actualizado' })
  avisarTaller(
    @Param('id') id: string,
    @Param('bitacoraId') bitacoraId: string,
    @Body('avisado') avisado: boolean = true,
    @Request() req?: { user?: { id: string } },
  ) {
    return this.pedidoService.avisarTallerBitacora(id, bitacoraId, Boolean(avisado), req?.user?.id);
  }

  @Delete(':id/bitacoras/:bitacoraId')
  @Roles(...COORDINACION)
  @ApiOperation({ summary: 'Eliminar registro de bitácora (Solo Coordinador/Admin)' })
  @ApiParam({ name: 'id', description: 'ID o código del pedido' })
  @ApiParam({ name: 'bitacoraId', description: 'ID del registro de bitácora' })
  @ApiResponse({ status: 200, description: 'Registro eliminado' })
  eliminarBitacora(@Param('id') id: string, @Param('bitacoraId') bitacoraId: string) {
    return this.pedidoService.eliminarBitacora(id, bitacoraId);
  }
}

