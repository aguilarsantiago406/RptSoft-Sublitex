import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, ROLES_GESTION_LISTA } from '../../../core/decorators/roles.decorator';
import { ExcepcionesService } from './excepciones.service';
import { CreateExcepcionDto } from './dto/create-excepcion.dto';

@ApiTags('Excepciones de Prenda')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(...ROLES_GESTION_LISTA)
@ApiBearerAuth()
export class ExcepcionesController {
  constructor(private readonly service: ExcepcionesService) {}

  @Post('excepciones-prenda')
  @ApiOperation({ summary: 'Registra una excepción delta sobre un atributo de la prenda (R-C01)' })
  crear(@Body() dto: CreateExcepcionDto) {
    return this.service.crear(dto);
  }

  @Delete('excepciones-prenda/:id')
  @ApiOperation({ summary: 'Elimina la excepción y devuelve la prenda al estándar del grupo' })
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
