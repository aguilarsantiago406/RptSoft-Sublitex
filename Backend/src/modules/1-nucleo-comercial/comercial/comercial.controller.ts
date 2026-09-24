import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TipoTarifa } from '@prisma/client';
import { ComercialService } from './comercial.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { CreateDatosEnvioDto } from './dto/create-datos-envio.dto';
import { UpdateDatosEnvioDto } from './dto/update-datos-envio.dto';
import { EmitirConfirmacionDto } from './dto/emitir-confirmacion.dto';

@ApiTags('Comercial / Tarifas y Envios')
@Controller('api/comercial')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}

  @Post('tarifas')
  @ApiOperation({ summary: 'Crear nueva tarifa (R-K10)' })
  @ApiResponse({ status: 201, description: 'Tarifa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Rango de fechas invalido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 409, description: 'Tarifa duplicada para tipo/concepto/fecha' })
  createTarifa(@Body() dto: CreateTarifaDto) {
    return this.comercialService.createTarifa(dto);
  }

  @Get('tarifas')
  @ApiOperation({ summary: 'Listar todas las tarifas (historicas y activas)' })
  @ApiQuery({ name: 'tipo', required: false, enum: TipoTarifa, description: 'Filtrar por tipo de tarifa' })
  @ApiResponse({ status: 200, description: 'Lista de tarifas' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  findAllTarifas(@Query('tipo') tipo?: string) {
    return this.comercialService.findAllTarifas(tipo);
  }

  @Get('tarifas/vigentes')
  @ApiOperation({ summary: 'Listar tarifas vigentes en rango de fecha actual' })
  @ApiQuery({ name: 'tipo', required: false, enum: TipoTarifa, description: 'Filtrar por tipo de tarifa' })
  @ApiResponse({ status: 200, description: 'Lista de tarifas vigentes hoy' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  getTarifasVigentes(@Query('tipo') tipo?: string) {
    return this.comercialService.getTarifasVigentes(tipo);
  }

  @Get('tarifas/:id')
  @ApiOperation({ summary: 'Obtener tarifa por ID' })
  @ApiParam({ name: 'id', description: 'ID unico de la tarifa (CUID)' })
  @ApiResponse({ status: 200, description: 'Detalle de la tarifa' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  findTarifa(@Param('id') id: string) {
    return this.comercialService.findTarifaById(id);
  }

  @Patch('tarifas/:id')
  @ApiOperation({ summary: 'Actualizar tarifa' })
  @ApiParam({ name: 'id', description: 'ID unico de la tarifa (CUID)' })
  @ApiResponse({ status: 200, description: 'Tarifa actualizada' })
  @ApiResponse({ status: 400, description: 'Rango de fechas invalido o datos incorrectos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  updateTarifa(@Param('id') id: string, @Body() dto: UpdateTarifaDto) {
    return this.comercialService.updateTarifa(id, dto);
  }

  @Delete('tarifas/:id')
  @ApiOperation({ summary: 'Eliminar tarifa' })
  @ApiParam({ name: 'id', description: 'ID unico de la tarifa (CUID)' })
  @ApiResponse({ status: 200, description: 'Tarifa eliminada' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  removeTarifa(@Param('id') id: string) {
    return this.comercialService.removeTarifa(id);
  }

  @Post('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Crear datos de envio para un pedido (R-K08)' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 201, description: 'Datos de envio creados' })
  @ApiResponse({ status: 400, description: 'Datos de envio invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiResponse({ status: 409, description: 'El pedido ya tiene datos de envio' })
  createDatosEnvio(@Param('pedidoId') pedidoId: string, @Body() dto: CreateDatosEnvioDto) {
    return this.comercialService.createDatosEnvio(pedidoId, dto);
  }

  @Get('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Obtener datos de envio de un pedido' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Datos de envio del pedido' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Datos de envio no encontrados' })
  findDatosEnvio(@Param('pedidoId') pedidoId: string) {
    return this.comercialService.findDatosEnvio(pedidoId);
  }

  @Patch('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Actualizar datos de envio de un pedido' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Datos de envio actualizados' })
  @ApiResponse({ status: 400, description: 'Datos de envio invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Datos de envio no encontrados' })
  updateDatosEnvio(@Param('pedidoId') pedidoId: string, @Body() dto: UpdateDatosEnvioDto) {
    return this.comercialService.updateDatosEnvio(pedidoId, dto);
  }

  @Delete('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Eliminar datos de envio de un pedido' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Datos de envio eliminados' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Datos de envio no encontrados' })
  removeDatosEnvio(@Param('pedidoId') pedidoId: string) {
    return this.comercialService.removeDatosEnvio(pedidoId);
  }

  @Post('pedidos/:pedidoId/confirmacion')
  @ApiOperation({ summary: 'Emitir confirmacion comercial congelada del pedido (R-H05, R-K06, R-K07)' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 201, description: 'Confirmacion emitida exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de confirmacion invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  emitirConfirmacion(
    @Param('pedidoId') pedidoId: string,
    @Body() dto: EmitirConfirmacionDto,
  ) {
    return this.comercialService.emitirConfirmacion(pedidoId, dto);
  }

  @Get('pedidos/:pedidoId/confirmaciones')
  @ApiOperation({ summary: 'Listar historial de confirmaciones de un pedido (R-K06)' })
  @ApiParam({ name: 'pedidoId', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Lista de confirmaciones ordenadas por version desc' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findConfirmaciones(@Param('pedidoId') pedidoId: string) {
    return this.comercialService.findConfirmaciones(pedidoId);
  }
}

