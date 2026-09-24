import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DisenoService } from './diseno.service';
import { CrearDisenoDto } from './dto/crear-diseno.dto';
import { ActualizarArtefactosDto } from './dto/actualizar-artefactos.dto';
import { EstadoDisenoDto } from './dto/estado-diseno.dto';

@ApiTags('Diseños')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DisenoController {
  constructor(private readonly disenoService: DisenoService) {}

  @Post('disenos')
  @ApiOperation({
    summary: 'Crea una nueva versión de diseño para un pedido (R-H02, R-H11)',
  })
  crear(@Body() dto: CrearDisenoDto) {
    return this.disenoService.crear(dto);
  }

  @Patch('disenos/:id/artefactos')
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
  @ApiOperation({ summary: 'Envía el diseño de BORRADOR a PROPUESTO' })
  proponer(@Param('id') id: string) {
    return this.disenoService.proponer(id);
  }

  @Patch('disenos/:id/aprobar')
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
  @ApiOperation({ summary: 'Rechaza el diseño con motivo opcional' })
  rechazar(@Param('id') id: string, @Body() dto: EstadoDisenoDto, @Request() req?: any) {
    if (!dto.usuarioId && req?.user?.id) {
      dto.usuarioId = req.user.id;
    }
    return this.disenoService.rechazar(id, dto);
  }

  @Get('pedidos/:pedidoId/disenos')
  @ApiOperation({ summary: 'Lista el historial de versiones del diseño' })
  listar(@Param('pedidoId') pedidoId: string) {
    return this.disenoService.listarPorPedido(pedidoId);
  }

  @Get('disenos/:id')
  @ApiOperation({ summary: 'Detalle de una versión de diseño' })
  detalle(@Param('id') id: string) {
    return this.disenoService.obtenerDetalle(id);
  }
}
