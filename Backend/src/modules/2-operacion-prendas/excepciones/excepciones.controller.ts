import { Controller, Post, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ExcepcionesService } from './excepciones.service';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';

@ApiTags('Excepciones de Prenda')
@Controller('api')
export class ExcepcionesController {
  constructor(private readonly service: ExcepcionesService) {}

  @Post('excepciones-prenda')
  @ApiOperation({
    summary:
      'Registra una excepción delta sobre un atributo de la prenda (R-C01)',
  })
  crear(@Body() dto: CreateExcepcionDto) {
    return this.service.crear(dto);
  }

  @Delete('excepciones-prenda/:id')
  @ApiOperation({
    summary: 'Elimina la excepción y devuelve la prenda al estándar del grupo',
  })
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
