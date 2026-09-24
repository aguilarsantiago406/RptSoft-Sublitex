import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service';

@ApiTags('Catalogos')
@Controller('api/catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('tipos-producto')
  @ApiOperation({ summary: 'Tipos de producto con piezas físicas (R-K03)' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de producto con sus piezas fisicas asociadas' })
  listTiposProducto() {
    return this.catalogoService.listTiposProducto();
  }

  @Get('tallas')
  @ApiOperation({ summary: 'Tallas por tipo de producto (R-E04)' })
  @ApiQuery({ name: 'tipoProductoId', required: false, description: 'ID del tipo de producto para filtrar tallas permitidas' })
  @ApiResponse({ status: 200, description: 'Lista de tallas disponibles' })
  listTallas(@Query('tipoProductoId') tipoProductoId?: string) {
    return this.catalogoService.listTallas(tipoProductoId);
  }

  @Get('atributos')
  @ApiOperation({ summary: 'Atributos con valores cerrados (R-B04)' })
  @ApiResponse({ status: 200, description: 'Lista de atributos con sus valores permitidos' })
  listAtributos() {
    return this.catalogoService.listAtributos();
  }

  @Get('ubicaciones')
  @ApiOperation({ summary: 'Ubicaciones de personalización (R-F02)' })
  @ApiResponse({ status: 200, description: 'Lista de ubicaciones de estampado permitidas' })
  listUbicaciones() {
    return this.catalogoService.listUbicaciones();
  }
}