import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../core/guards/roles.guard';
import { Roles, ROLES_TODOS } from '../../../core/decorators/roles.decorator';
import { AuditoriaService } from './auditoria.service';
import { ListarRegistrosCambioDto } from './dto/listar-registros-cambio.dto';

@ApiTags('Auditoría')
@Controller('api')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(...ROLES_TODOS)
@ApiBearerAuth()
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
