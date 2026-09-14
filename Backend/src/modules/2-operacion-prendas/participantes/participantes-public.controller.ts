import { Controller, Get, Put, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParticipantesService } from './participantes.service';
import { GuardarFichaEnlaceDto } from './dto/guardar-ficha-enlace.dto';

@ApiTags('Participantes - Enlace Público (Sin JWT)')
@Controller('api/participantes/enlace')
export class ParticipantesPublicController {
  constructor(private readonly service: ParticipantesService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Carga inicial de la ficha del participante y sus prendas vía WhatsApp token' })
  obtenerFicha(@Param('token') token: string) {
    return this.service.obtenerPorEnlaceToken(token);
  }

  @Put(':token/ficha')
  @ApiOperation({ summary: 'Guarda la ficha mínima del participante desde su enlace' })
  guardarFicha(@Param('token') token: string, @Body() dto: GuardarFichaEnlaceDto) {
    return this.service.guardarFichaEnlace(token, dto);
  }

  @Post(':token/confirmar')
  @ApiOperation({ summary: 'El participante confirma definitivamente sus datos' })
  confirmar(@Param('token') token: string) {
    return this.service.confirmarPorEnlace(token);
  }
}
