import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DisenoService } from './diseno.service';
import { CrearDisenoDto } from './dto/crear-diseno.dto';
import { ActualizarArtefactosDto } from './dto/actualizar-artefactos.dto';
import { EstadoDisenoDto } from './dto/estado-diseno.dto';

import { RolesGuard } from '../../../core/guards/roles.guard';
import {
  Roles,
  ROLES_DISENO,
  ROLES_DISENO_APROBACION,
  ROLES_DISENO_RAPIDO,
  ROLES_TODOS,
} from '../../../core/decorators/roles.decorator';

@ApiTags('Diseños')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class DisenoController {
  constructor(private readonly disenoService: DisenoService) {}

  @Post('disenos')
  @Roles(...ROLES_DISENO_RAPIDO)
  @ApiOperation({
    summary: 'Crea una nueva versión de diseño para un pedido (R-H02, R-H11, opción WhatsApp)',
  })
  crear(@Body() dto: CrearDisenoDto, @Request() req?: any) {
    if (!dto.usuarioId && req?.user?.id) {
      dto.usuarioId = req.user.id;
    }
    return this.disenoService.crear(dto);
  }

  @Patch('disenos/:id/artefactos')
  @Roles(...ROLES_DISENO)
  @ApiOperation({
    summary: 'Reemplaza archivo de sublimación e imagen de vista previa',
  })
  actualizarArtefactos(
    @Param('id') id: string,
    @Body() dto: ActualizarArtefactosDto,
  ) {
    return this.disenoService.actualizarArtefactos(id, dto);
  }

  @Patch('disenos/:id/proponer')
  @Roles(...ROLES_DISENO)
  @ApiOperation({ summary: 'Envía el diseño de BORRADOR a PROPUESTO' })
  proponer(@Param('id') id: string) {
    return this.disenoService.proponer(id);
  }

  @Patch('disenos/:id/aprobar')
  @Roles(...ROLES_DISENO_APROBACION)
  @ApiOperation({
    summary:
      'Aprueba el diseño (R-K05 exige todos los colores con código hex; R-H02 habilita cerrar el bloque Diseño)',
  })
  aprobar(@Param('id') id: string, @Body() dto: EstadoDisenoDto, @Request() req?: any) {
    if (!dto.usuarioId && req?.user?.id) {
      dto.usuarioId = req.user.id;
    }
    return this.disenoService.aprobar(id, dto);
  }

  @Patch('disenos/:id/rechazar')
  @Roles(...ROLES_DISENO_APROBACION)
  @ApiOperation({ summary: 'Rechaza el diseño con motivo opcional' })
  rechazar(@Param('id') id: string, @Body() dto: EstadoDisenoDto, @Request() req?: any) {
    if (!dto.usuarioId && req?.user?.id) {
      dto.usuarioId = req.user.id;
    }
    return this.disenoService.rechazar(id, dto);
  }

  @Patch('disenos/:id/aprobar-whatsapp')
  @Roles(...ROLES_DISENO_RAPIDO)
  @ApiOperation({ summary: 'Aprueba el diseño directamente según modelo aprobado por WhatsApp' })
  aprobarPorWhatsApp(@Param('id') id: string, @Request() req?: any) {
    const usuarioId = req?.user?.id;
    return this.disenoService.aprobarPorWhatsApp(id, usuarioId);
  }

  @Get('pedidos/:pedidoId/disenos')
  @Roles(...ROLES_TODOS)
  @ApiOperation({ summary: 'Lista el historial de versiones del diseño' })
  listar(@Param('pedidoId') pedidoId: string) {
    return this.disenoService.listarPorPedido(pedidoId);
  }

  @Get('disenos/:id')
  @Roles(...ROLES_TODOS)
  @ApiOperation({ summary: 'Detalle de una versión de diseño' })
  detalle(@Param('id') id: string) {
    return this.disenoService.obtenerDetalle(id);
  }
}
