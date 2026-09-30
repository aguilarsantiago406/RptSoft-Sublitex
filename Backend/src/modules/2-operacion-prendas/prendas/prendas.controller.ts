import { Controller, Post, Patch, Delete, Get, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../core/guards/roles.guard';
import {
  Roles,
  ROLES_GESTION_LISTA,
  ROLES_TODOS,
} from '../../../core/decorators/roles.decorator';
import { PrendasService } from './prendas.service';
import { CreatePrendaDto } from './dto/create-prenda.dto';
import { UpdateFichaMinimaDto } from './dto/update-ficha-minima.dto';

@ApiTags('Prendas')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class PrendasController {
  constructor(private readonly service: PrendasService) {}

  @Post('prendas')
  @Roles(...ROLES_GESTION_LISTA)
  @ApiOperation({ summary: 'Crea una prenda asignada a un participante' })
  crear(@Body() dto: CreatePrendaDto, @Request() req?: any) {
    return this.service.crear(dto, req?.user);
  }

  @Patch('prendas/:id')
  @Roles(...ROLES_GESTION_LISTA)
  @ApiOperation({ summary: 'Actualiza la ficha mínima de la prenda (talla, número, género, apodo, color)' })
  actualizar(@Param('id') id: string, @Body() dto: UpdateFichaMinimaDto, @Request() req?: any) {
    return this.service.actualizarFichaMinima(id, dto, req?.user);
  }

  @Delete('prendas/:id')
  @Roles(...ROLES_GESTION_LISTA)
  @ApiOperation({ summary: 'Elimina una prenda de la lista' })
  eliminar(@Param('id') id: string, @Request() req?: any) {
    return this.service.eliminar(id, req?.user);
  }

  @Get('pedidos/:pedidoId/resumen-produccion')
  @Roles(...ROLES_TODOS)
  @ApiOperation({ summary: 'Obtiene el resumen consolidado de produccion por piezas fisicas reales (R-K03)' })
  resumen(@Param('pedidoId') pedidoId: string) {
    return this.service.obtenerResumenProduccion(pedidoId);
  }

  @Get('pedidos/:pedidoId/diagnostico-cierre-lista')
  @Roles(...ROLES_GESTION_LISTA)
  @ApiOperation({
    summary: 'Diagnóstico preventivo previo al cierre de lista con alertas bloqueantes e informativas (R-H09 / R-I06..R-I09)',
  })
  diagnosticoCierreLista(@Param('pedidoId') pedidoId: string) {
    return this.service.obtenerDiagnosticoCierreLista(pedidoId);
  }

  @Get('pedidos/:pedidoId/validacion-cierre-lista')
  @Roles(...ROLES_GESTION_LISTA)
  @ApiOperation({
    summary: 'Alias de diagnóstico preventivo previo al cierre de lista (R-H09)',
  })
  validacionCierreLista(@Param('pedidoId') pedidoId: string) {
    return this.service.obtenerDiagnosticoCierreLista(pedidoId);
  }
}
