import { PartialType } from '@nestjs/swagger';
import { CreateDatosEnvioDto } from './create-datos-envio.dto';

export class UpdateDatosEnvioDto extends PartialType(CreateDatosEnvioDto) {}