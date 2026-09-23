import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { AddColorDto } from './dto/add-color.dto';

@ApiTags('Pedidos')
@Controller('api/pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo pedido - genera codigo SUB-XXXX' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreatePedidoDto) {
    return this.pedidoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pedidos' })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'clienteId', required: false })
  findAll(@Query('estado') estado?: string, @Query('clienteId') clienteId?: string) {
    return this.pedidoService.findAll(estado, clienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de pedido con grupos y colores' })
  @ApiResponse({ status: 404 })
  findOne(@Param('id') id: string) {
    return this.pedidoService.findOne(id);
  }

  @Get(':id/conciliacion-comercial')
  @ApiOperation({ summary: 'Conciliacion comercial: cantidad contratada vs prendas registradas por grupo (R-B02, R-H03)' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  conciliacionComercial(@Param('id') id: string) {
    return this.pedidoService.resumenProduccion(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar estado del pedido (R-A06)' })
  updateEstado(@Param('id') id: string, @Body() dto: UpdateEstadoDto) {
    return this.pedidoService.updateEstado(id, dto);
  }

  @Post(':id/colores')
  @ApiOperation({ summary: 'Agregar color oficial HEX (R-K05)' })
  @ApiResponse({ status: 201 })
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
  @ApiOperation({ summary: 'Listar colores del pedido' })
  getColores(@Param('id') id: string) {
    return this.pedidoService.getColores(id);
  }

  @Delete(':id/colores/:colorId')
  @ApiOperation({ summary: 'Eliminar color del pedido' })
  deleteColor(@Param('id') id: string, @Param('colorId') colorId: string) {
    return this.pedidoService.deleteColor(id, colorId);
  }
}
