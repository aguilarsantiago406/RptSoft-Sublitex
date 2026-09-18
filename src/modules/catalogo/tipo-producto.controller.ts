import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogoService } from './catalogo.service';

@ApiTags('Catalogos')
@Controller('api/tipos-producto')
export class TipoProductoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  @ApiOperation({ summary: 'Tipos de producto con piezas físicas (R-K03)' })
  list() {
    return this.catalogoService.listTiposProducto();
  }
}
