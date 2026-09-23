import { Controller, Post, Patch, Delete, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrendasService } from './prendas.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';

@ApiTags('Prendas')
@Controller('api')
export class PrendasController {
  constructor(private readonly service: PrendasService) {}

  @Post('prendas')
  @ApiOperation({ summary: 'Crea una prenda asignada a un participante' })
  crear(@Body() dto: CreatePrendaDto) {
    return this.service.crear(dto);
  }

  @Patch('prendas/:id')
  @ApiOperation({ summary: 'Actualiza la ficha minima de la prenda (talla, numero, genero, apodo)' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateFichaMinimaDto) {
    return this.service.actualizarFichaMinima(id, dto);
  }

  @Delete('prendas/:id')
  @ApiOperation({ summary: 'Elimina una prenda de la lista' })
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }

  @Get('pedidos/:pedidoId/resumen-produccion')
  @ApiOperation({ summary: 'Obtiene el resumen consolidado de produccion por piezas fisicas reales (R-K03)' })
  resumen(@Param('pedidoId') pedidoId: string) {
    return this.service.obtenerResumenProduccion(pedidoId);
  }
}
