import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';

@ApiTags('Clientes')
@Controller('api/clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente / organización' })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  create(@Body() dto: CreateClienteDto) {
    return this.clienteService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiQuery({ name: 'q', required: false, description: 'Búsqueda por nombre' })
  findAll(@Query('q') q?: string) {
    return this.clienteService.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  findOne(@Param('id') id: string) {
    return this.clienteService.findOne(id);
  }
}
