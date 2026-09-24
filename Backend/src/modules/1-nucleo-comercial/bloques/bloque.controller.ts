import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TipoBloque } from '@prisma/client';
import { BloqueService } from './bloque.service';
import { ReabrirBloqueDto } from './dto/reabrir-bloque.dto';

@ApiTags('Bloques de Pedido')
@Controller('api/pedidos')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BloqueController {
  constructor(private readonly bloqueService: BloqueService) {}

  @Get(':id/bloques')
  @ApiOperation({ summary: 'Consultar estado consolidado de los 3 bloques de un pedido (R-H01, R-H11)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Estado de los bloques DISENO, LISTA y COMERCIAL' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  getBloques(@Param('id') id: string) {
    return this.bloqueService.getBloques(id);
  }

  @Post(':id/bloques/:tipo/cerrar')
  @ApiOperation({ summary: 'Cerrar formalmente un bloque del pedido y congelar snapshot (R-H01, R-H03, R-H11)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiParam({ name: 'tipo', enum: TipoBloque, description: 'Tipo de bloque a cerrar' })
  @ApiResponse({ status: 201, description: 'Bloque cerrado y version congelada creada' })
  @ApiResponse({ status: 400, description: 'Validacion fallida o condiciones previas incompletas' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido o bloque no encontrado' })
  cerrarBloque(
    @Param('id') id: string,
    @Param('tipo') tipo: TipoBloque,
    @Request() req: { user: { id: string } },
  ) {
    return this.bloqueService.cerrarBloque(id, tipo, req.user.id);
  }

  @Post(':id/bloques/:tipo/reabrir')
  @ApiOperation({ summary: 'Reapertura formal de un bloque cerrado con motivo obligatorio (R-H12, R-H13, R-H14)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiParam({ name: 'tipo', enum: TipoBloque, description: 'Tipo de bloque a reabrir' })
  @ApiResponse({ status: 201, description: 'Bloque reabierto y nueva version inmutable registrada' })
  @ApiResponse({ status: 400, description: 'Bloque no esta cerrado o motivo ausente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido o bloque no encontrado' })
  reabrirBloque(
    @Param('id') id: string,
    @Param('tipo') tipo: TipoBloque,
    @Body() dto: ReabrirBloqueDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.bloqueService.reabrirBloque(id, tipo, dto, req.user.id);
  }
}
