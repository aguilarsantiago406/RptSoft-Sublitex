import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolUsuario } from '@prisma/client';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles } from '../../../core/decorators/roles.decorator';

const COMERCIAL = [RolUsuario.ADMINISTRADOR, RolUsuario.VENDEDOR, RolUsuario.VENDEDORA, RolUsuario.COORDINADOR_OPERATIVO];
const TODOS = Object.values(RolUsuario) as RolUsuario[];

@ApiTags('Clientes')
@Controller('api/clientes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @Roles(...COMERCIAL)
  @ApiOperation({ summary: 'Crear nuevo cliente / organización' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 403, description: 'Rol sin permiso para crear clientes' })
  create(@Body() dto: CreateClienteDto) {
    return this.clienteService.create(dto);
  }

  @Get()
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ name: 'q', required: false, description: 'Búsqueda por nombre o ciudad' })
  @ApiResponse({ status: 200, description: 'Lista de clientes encontrados' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  findAll(@Query('q') q?: string) {
    return this.clienteService.findAll(q);
  }

  @Get(':id')
  @Roles(...TODOS)
  @ApiOperation({ summary: 'Obtener cliente por ID con historial de pedidos' })
  @ApiParam({ name: 'id', description: 'ID único del cliente (CUID)' })
  @ApiResponse({ status: 200, description: 'Detalle del cliente y lista de sus pedidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Requiere JWT' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }
}
