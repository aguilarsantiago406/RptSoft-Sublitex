import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

@ApiTags('Grupos')
@Controller('api')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post('pedidos/:id/grupos')
  @ApiOperation({ summary: 'Crear grupo dentro de un pedido (R-B01, R-B02, R-G01)' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'Pedido o tipo de producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de grupo duplicado en el pedido (R-B01)' })
  create(@Param('id') pedidoId: string, @Body() dto: CreateGrupoDto) {
    return this.grupoService.create(pedidoId, dto);
  }

  @Get('pedidos/:id/grupos')
  @ApiOperation({ summary: 'Listar grupos de un pedido' })
  findByPedido(@Param('id') pedidoId: string) {
    return this.grupoService.findByPedido(pedidoId);
  }

  @Get('grupos/:id')
  @ApiOperation({ summary: 'Detalle de un grupo con su tipo de producto' })
  findOne(@Param('id') id: string) {
    return this.grupoService.findOne(id);
  }

  @Put('grupos/:id')
  @ApiOperation({ summary: 'Actualizar configuracion de un grupo' })
  update(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.grupoService.update(id, dto);
  }

  @Patch('grupos/:id')
  @ApiOperation({ summary: 'Actualizar campos de un grupo incluyendo configuracion (R-B03, R-B07)' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Grupo, atributo o valor no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de grupo duplicado en el pedido (R-B01)' })
  patch(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.grupoService.update(id, dto);
  }

  @Delete('grupos/:id')
  @ApiOperation({ summary: 'Eliminar un grupo sin prendas ni participantes' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'El grupo tiene informacion dependiente' })
  remove(@Param('id') id: string) {
    return this.grupoService.remove(id);
  }

  @Patch('grupos/:id/politica')
  @ApiOperation({ summary: 'Cambiar politica LIBRE o UNICA (R-G01). Con repetidos falla (R-G06)' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'Existen numeros repetidos, no se aplica la politica UNICA (R-G06)' })
  updatePolitica(@Param('id') id: string, @Body() dto: UpdatePoliticaDto) {
    return this.grupoService.updatePolitica(id, dto);
  }
}
