import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { UpdatePoliticaDto } from './dto/update-politica.dto';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

const COMERCIAL = [RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.VENDEDORA, RolUsuario.COORDINADOR_OPERATIVO];
const TODOS = Object.values(RolUsuario) as RolUsuario[];

@ApiTags('Grupos')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class GrupoController {
  constructor(private readonly grupoService: GrupoService) {}

  @Post('pedidos/:id/grupos')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Crear grupo dentro de un pedido (R-B01, R-B02, R-G01)' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 201, description: 'Grupo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para crear grupos' })
  @ApiResponse({ status: 404, description: 'Pedido o tipo de producto no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de grupo duplicado en el pedido (R-B01)' })
  create(@Param('id') pedidoId: string, @Body() dto: CreateGrupoDto) {
    return this.grupoService.create(pedidoId, dto);
  }

  @Get('pedidos/:id/grupos')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar grupos de un pedido' })
  @ApiParam({ name: 'id', description: 'ID unico del pedido (CUID)' })
  @ApiResponse({ status: 200, description: 'Lista de grupos del pedido con configuracion y tipoProducto' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findByPedido(@Param('id') pedidoId: string) {
    return this.grupoService.findByPedido(pedidoId);
  }

  @Get('grupos/:id')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Detalle de un grupo con su tipo de producto' })
  @ApiParam({ name: 'id', description: 'ID unico del grupo (CUID)' })
  @ApiResponse({ status: 200, description: 'Detalle completo del grupo' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.grupoService.findOne(id);
  }

  @Put('grupos/:id')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Actualizar configuracion de un grupo' })
  @ApiParam({ name: 'id', description: 'ID unico del grupo (CUID)' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para editar grupos' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  update(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.grupoService.update(id, dto);
  }

  @Patch('grupos/:id')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Actualizar campos de un grupo incluyendo configuracion (R-B03, R-B07)' })
  @ApiParam({ name: 'id', description: 'ID unico del grupo (CUID)' })
  @ApiResponse({ status: 200, description: 'Grupo actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos invalidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para editar grupos' })
  @ApiResponse({ status: 404, description: 'Grupo, atributo o valor no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de grupo duplicado en el pedido (R-B01)' })
  patch(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.grupoService.update(id, dto);
  }

  @Delete('grupos/:id')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Eliminar un grupo sin prendas ni participantes' })
  @ApiParam({ name: 'id', description: 'ID unico del grupo (CUID)' })
  @ApiResponse({ status: 200, description: 'Grupo eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para eliminar grupos' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'El grupo tiene informacion dependiente' })
  remove(@Param('id') id: string) {
    return this.grupoService.remove(id);
  }

  @Patch('grupos/:id/politica')
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Cambiar politica LIBRE o UNICA (R-G01). Con repetidos falla (R-G06)' })
  @ApiParam({ name: 'id', description: 'ID unico del grupo (CUID)' })
  @ApiResponse({ status: 200, description: 'Politica de numeracion actualizada' })
  @ApiResponse({ status: 400, description: 'Politica invalida' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para cambiar politica' })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  @ApiResponse({ status: 409, description: 'Existen numeros repetidos, no se aplica la politica UNICA (R-G06)' })
  updatePolitica(@Param('id') id: string, @Body() dto: UpdatePoliticaDto) {
    return this.grupoService.updatePolitica(id, dto);
  }
}
