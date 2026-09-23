import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditoriaService } from './auditoria.service';
import { ListarRegistrosCambioDto } from './dto/listar-registros-cambio.dto';

@ApiTags('Auditoría')
@Controller('api')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('registros-cambio')
  @ApiOperation({
    summary:
      'Lista el historial de cambios de un pedido (R-I01..R-I05, append-only)',
  })
  listar(@Query() dto: ListarRegistrosCambioDto) {
    return this.auditoriaService.listar(dto);
  }
}
