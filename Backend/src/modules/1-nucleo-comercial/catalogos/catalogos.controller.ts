import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';

@ApiTags('Catálogos Maestros')
@Controller('api/catalogos')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}
}
