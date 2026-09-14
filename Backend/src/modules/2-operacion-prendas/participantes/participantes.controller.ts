import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ParticipantesService } from './participantes.service';
import { CreateParticipanteDto } from './dto/create-participante.dto';

@ApiTags('Participantes')
@Controller('api')
export class ParticipantesController {
  constructor(private readonly service: ParticipantesService) {}

  @Post('grupos/:grupoId/participantes')
  @ApiOperation({ summary: 'Crea un nuevo participante en el grupo con su enlace token' })
  crear(@Param('grupoId') grupoId: string, @Body() dto: CreateParticipanteDto) {
    return this.service.crearEnGrupo(grupoId, dto);
  }

  @Get('grupos/:grupoId/participantes')
  @ApiOperation({ summary: 'Lista todos los participantes del grupo con prendas y personalizaciones' })
  listar(@Param('grupoId') grupoId: string) {
    return this.service.listarPorGrupo(grupoId);
  }

  @Get('participantes/:id')
  @ApiOperation({ summary: 'Obtiene el detalle individual de un participante' })
  obtener(@Param('id') id: string) {
    return this.service.obtenerPorId(id);
  }

  @Post('participantes/:id/confirmar')
  @ApiOperation({ summary: 'Confirmación manual del participante por parte del coordinador' })
  confirmarManual(@Param('id') id: string) {
    return this.service.confirmarManual(id);
  }

  @Post('participantes/:id/revocar-enlace')
  @ApiOperation({ summary: 'Revoca el enlace de WhatsApp del participante' })
  revocar(@Param('id') id: string) {
    return this.service.revocarEnlace(id);
  }

  @Post('participantes/:id/regenerar-enlace')
  @ApiOperation({ summary: 'Genera un nuevo enlace y token para el participante' })
  regenerar(@Param('id') id: string) {
    return this.service.regenerarEnlace(id);
  }
}
