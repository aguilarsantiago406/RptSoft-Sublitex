import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ComercialService } from './comercial.service';

@ApiTags('Comercial / Tarifas')
@Controller('api/comercial')
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}
}
