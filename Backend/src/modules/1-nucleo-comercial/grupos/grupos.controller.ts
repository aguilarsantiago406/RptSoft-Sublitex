import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GruposService } from './grupos.service';

@ApiTags('Grupos')
@Controller('api/grupos')
export class GruposController {
  constructor(private readonly gruposService: GruposService) {}
}
