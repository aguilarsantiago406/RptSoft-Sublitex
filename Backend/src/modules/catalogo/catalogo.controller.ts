import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service';

@ApiTags('Catalogos')
@Controller('api/catalogos')
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get('tipos-producto')
  @ApiOperation({ summary: 'Tipos de producto con piezas físicas (R-K03)' })
  listTiposProducto() {
    return this.catalogoService.listTiposProducto();
  }

  @Get('tallas')
  @ApiOperation({ summary: 'Tallas por tipo de producto (R-E04)' })
  listTallas(@Query('tipoProductoId') tipoProductoId?: string) {
    return this.catalogoService.listTallas(tipoProductoId);
  }

  @Get('atributos')
  @ApiOperation({ summary: 'Atributos con valores cerrados (R-B04)' })
  listAtributos() {
    return this.catalogoService.listAtributos();
  }

  @Get('ubicaciones')
  @ApiOperation({ summary: 'Ubicaciones de personalización (R-F02)' })
  listUbicaciones() {
    return this.catalogoService.listUbicaciones();
  }
}