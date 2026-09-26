import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PersonalizacionesService } from './personalizaciones.service';
import { CreatePersonalizacionDto } from './dto/create-personalizacion.dto';

@ApiTags('Personalizaciones')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PersonalizacionesController {
  constructor(private readonly service: PersonalizacionesService) {}

  @Post('personalizaciones')
  @ApiOperation({ summary: 'Registra un estampado con ubicación declarada en la prenda (R-F01)' })
  crear(@Body() dto: CreatePersonalizacionDto) {
    return this.service.crear(dto);
  }

  @Delete('personalizaciones/:id')
  @ApiOperation({ summary: 'Elimina un estampado de la prenda' })
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(id);
  }
}
