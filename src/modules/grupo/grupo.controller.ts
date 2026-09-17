import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';

@ApiTags('Grupos')
@Controller('api')
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
  @ApiOperation({ summary: 'Actualizar configuración de un grupo (diseño, política, tela)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateGrupoDto>) {
    return this.grupoService.update(id, dto);
  }

  @Delete('grupos/:id')
  @ApiOperation({ summary: 'Eliminar un grupo sin prendas ni participantes' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'El grupo tiene información dependiente' })
  remove(@Param('id') id: string) {
    return this.grupoService.remove(id);
  }

  @Patch('grupos/:id/politica')
  @ApiOperation({ summary: 'Cambiar política LIBRE o UNICA (R-G01). Con repetidos falla (R-G06)' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'Existen números repetidos, no se aplica la política UNICA (R-G06)' })
  updatePolitica(@Param('id') id: string, @Body() dto: UpdatePoliticaDto) {
    return this.grupoService.updatePolitica(id, dto);
  }
}