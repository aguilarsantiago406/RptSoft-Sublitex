import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';

@ApiTags('Clientes')
@Controller('api/clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}
}
