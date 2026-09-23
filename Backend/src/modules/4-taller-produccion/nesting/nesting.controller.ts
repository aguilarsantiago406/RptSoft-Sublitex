import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NestingService } from './nesting.service';
import { CrearNestingDto } from './dto/crear-nesting.dto';
import { CrearNestingParteDto } from './dto/crear-nesting-parte.dto';
import { CrearArchivoTifDto } from './dto/crear-archivo-tif.dto';

@ApiTags('Producción')
@Controller('api')
export class NestingController {
  constructor(private readonly nestingService: NestingService) {}

  @Post('nestings')
  @ApiOperation({
    summary:
      'Crea un nesting sobre una tela (R-K11: puede mezclar varios pedidos)',
  })
  crear(@Body() dto: CrearNestingDto) {
    return this.nestingService.crear(dto);
  }

  @Get('nestings')
  @ApiOperation({ summary: 'Lista los nestings' })
  listar() {
    return this.nestingService.listar();
  }

  @Get('nestings/:id')
  @ApiOperation({ summary: 'Detalle de un nesting con partes y archivos' })
  detalle(@Param('id') id: string) {
    return this.nestingService.obtenerDetalle(id);
  }

  @Post('nestings/:id/partes')
  @ApiOperation({
    summary:
      'Agrega una parte real (ancho/largo en cm) asignada a un pedido (R-K11, R-K15)',
  })
  agregarParte(@Param('id') id: string, @Body() dto: CrearNestingParteDto) {
    return this.nestingService.agregarParte(id, dto);
  }

  @Post('nestings/:id/archivos')
  @ApiOperation({
    summary:
      'Registra un archivo TIF exportado, con su serie (R-K13 ≤ 5 m por pieza)',
  })
  agregarArchivo(@Param('id') id: string, @Body() dto: CrearArchivoTifDto) {
    return this.nestingService.agregarArchivo(id, dto);
  }

  @Get('consumo-tela/pedido/:pedidoId')
  @ApiOperation({
    summary:
      'Consumo de tela de un pedido: suma de SUS partes (R-K15) y costo por metros lineales (R-K14)',
  })
  consumo(@Param('pedidoId') pedidoId: string) {
    return this.nestingService.consumoPorPedido(pedidoId);
  }
}
