import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NestingService } from './nesting.service';
import { CrearNestingDto } from './dto/crear-nesting.dto';
import { CrearNestingParteDto } from './dto/crear-nesting-parte.dto';
import { CrearArchivoTifDto } from './dto/crear-archivo-tif.dto';
import { BloqueService } from '../../1-nucleo-comercial/bloques/bloque.service';
import { AcusarReciboDto } from '../../1-nucleo-comercial/bloques/dto/acusar-recibo.dto';

import { RolesGuard } from '../../../core/guards/roles.guard';
import {
  Roles,
  ROLES_PRODUCCION,
  ROLES_ACUSE_TALLER,
  ROLES_TODOS,
} from '../../../core/decorators/roles.decorator';

@ApiTags('Producción')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class NestingController {
  constructor(
    private readonly nestingService: NestingService,
    private readonly bloqueService: BloqueService,
  ) {}

  @Post('nestings')
  @Roles(...ROLES_PRODUCCION)
  @ApiOperation({
    summary:
      'Crea un nesting sobre una tela (R-K11: puede mezclar varios pedidos)',
  })
  crear(@Body() dto: CrearNestingDto, @Request() req?: any) {
    return this.nestingService.crear(dto, req?.user?.id);
  }

  @Get('nestings')
  @Roles(...ROLES_TODOS)
  @ApiOperation({ summary: 'Lista los nestings' })
  listar() {
    return this.nestingService.listar();
  }

  @Get('nestings/:id')
  @Roles(...ROLES_TODOS)
  @ApiOperation({ summary: 'Detalle de un nesting con partes y archivos' })
  detalle(@Param('id') id: string) {
    return this.nestingService.obtenerDetalle(id);
  }

  @Post('nestings/:id/partes')
  @Roles(...ROLES_PRODUCCION)
  @ApiOperation({
    summary:
      'Agrega una parte real (ancho/largo en cm) asignada a un pedido (R-K11, R-K15)',
  })
  agregarParte(
    @Param('id') id: string,
    @Body() dto: CrearNestingParteDto,
    @Request() req?: any,
  ) {
    return this.nestingService.agregarParte(id, dto, req?.user);
  }

  @Post('nestings/:id/archivos')
  @Roles(...ROLES_PRODUCCION)
  @ApiOperation({
    summary:
      'Registra un archivo TIF exportado, con su serie (R-K13 ≤ 5 m por pieza)',
  })
  agregarArchivo(@Param('id') id: string, @Body() dto: CrearArchivoTifDto) {
    return this.nestingService.agregarArchivo(id, dto);
  }

  @Get('consumo-tela/pedido/:pedidoId')
  @Roles(...ROLES_TODOS)
  @ApiOperation({
    summary:
      'Consumo de tela de un pedido: suma de SUS partes (R-K15) y costo por metros lineales (R-K14)',
  })
  consumo(@Param('pedidoId') pedidoId: string) {
    return this.nestingService.consumoPorPedido(pedidoId);
  }

  @Patch('taller/pedidos/:pedidoId/versiones/:versionId/acusar')
  @Roles(...ROLES_ACUSE_TALLER)
  @ApiOperation({
    summary:
      'Registrar acuse de recibo de taller/diseno para una version tras reapertura (R-H14)',
  })
  acusarReciboTaller(
    @Param('pedidoId') pedidoId: string,
    @Param('versionId') versionId: string,
    @Body() dto: AcusarReciboDto,
    @Request() req?: any,
  ) {
    return this.bloqueService.acusarReciboVersion(pedidoId, versionId, req?.user, dto);
  }

  @Get('taller/pedidos/:pedidoId/alertas-reapertura')
  @Roles(...ROLES_ACUSE_TALLER)
  @ApiOperation({
    summary:
      'Listar versiones de bloques con reapertura y pendientes de acuse en taller (R-H14)',
  })
  listarAlertasReaperturaTaller(@Param('pedidoId') pedidoId: string) {
    return this.bloqueService.listarVersionesPendientesAcuse(pedidoId);
  }
}
