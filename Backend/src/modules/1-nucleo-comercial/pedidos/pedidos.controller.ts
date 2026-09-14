import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';

@ApiTags('Pedidos')
@Controller('api/pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}
}
