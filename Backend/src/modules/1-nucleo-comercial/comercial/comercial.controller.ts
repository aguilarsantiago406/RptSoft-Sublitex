import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ComercialService } from './comercial.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { CreateDatosEnvioDto } from './dto/create-datos-envio.dto';
import { UpdateDatosEnvioDto } from './dto/update-datos-envio.dto';

@ApiTags('Comercial / Tarifas y Envíos')
@Controller('api/comercial')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}

  // ==================== TARIFAS ====================

  @Post('tarifas')
  @ApiOperation({ summary: 'Crear nueva tarifa (R-K10)' })
  @ApiResponse({ status: 201, description: 'Tarifa creada' })
  @ApiResponse({ status: 409, description: 'Tarifa duplicada para tipo/concepto/fecha' })
  createTarifa(@Body() dto: CreateTarifaDto) {
    return this.comercialService.createTarifa(dto);
  }

  @Get('tarifas')
  @ApiOperation({ summary: 'Listar todas las tarifas' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['PRODUCTO', 'RECARGO_TALLA', 'RECARGO_TELA', 'RECARGO_CUELLO', 'RECARGO_ACABADO', 'ADICIONAL', 'COSTO_INTERNO'] })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  findAllTarifas(@Query('tipo') tipo?: string, @Query('activo') activo?: string) {
    return this.comercialService.findAllTarifas(tipo, activo === 'true');
  }

  @Get('tarifas/vigentes')
  @ApiOperation({ summary: 'Listar tarifas vigentes (activas y en rango de fecha)' })
  @ApiQuery({ name: 'tipo', required: false })
  getTarifasVigentes(@Query('tipo') tipo?: string) {
    return this.comercialService.getTarifasVigentes(tipo);
  }

  @Get('tarifas/:id')
  @ApiOperation({ summary: 'Obtener tarifa por ID' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  findTarifa(@Param('id') id: string) {
    return this.comercialService.findTarifaById(id);
  }

  @Patch('tarifas/:id')
  @ApiOperation({ summary: 'Actualizar tarifa' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  updateTarifa(@Param('id') id: string, @Body() dto: UpdateTarifaDto) {
    return this.comercialService.updateTarifa(id, dto);
  }

  @Delete('tarifas/:id')
  @ApiOperation({ summary: 'Eliminar tarifa' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  removeTarifa(@Param('id') id: string) {
    return this.comercialService.removeTarifa(id);
  }

  // ==================== DATOS DE ENVÍO ====================

  @Post('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Crear datos de envío para un pedido (R-K08)' })
  @ApiResponse({ status: 201, description: 'Datos de envío creados' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  @ApiResponse({ status: 409, description: 'El pedido ya tiene datos de envío' })
  createDatosEnvio(@Param('pedidoId') pedidoId: string, @Body() dto: CreateDatosEnvioDto) {
    return this.comercialService.createDatosEnvio(pedidoId, dto);
  }

  @Get('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Obtener datos de envío de un pedido' })
  @ApiResponse({ status: 404, description: 'Datos de envío no encontrados' })
  findDatosEnvio(@Param('pedidoId') pedidoId: string) {
    return this.comercialService.findDatosEnvio(pedidoId);
  }

  @Patch('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Actualizar datos de envío de un pedido' })
  @ApiResponse({ status: 404, description: 'Datos de envío no encontrados' })
  updateDatosEnvio(@Param('pedidoId') pedidoId: string, @Body() dto: UpdateDatosEnvioDto) {
    return this.comercialService.updateDatosEnvio(pedidoId, dto);
  }

  @Delete('pedidos/:pedidoId/envio')
  @ApiOperation({ summary: 'Eliminar datos de envío de un pedido' })
  @ApiResponse({ status: 404, description: 'Datos de envío no encontrados' })
  removeDatosEnvio(@Param('pedidoId') pedidoId: string) {
    return this.comercialService.removeDatosEnvio(pedidoId);
  }
}