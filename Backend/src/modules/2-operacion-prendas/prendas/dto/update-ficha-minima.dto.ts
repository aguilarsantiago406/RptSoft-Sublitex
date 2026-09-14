import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GeneroEnum } from '../../participantes/dto/guardar-ficha-enlace.dto';

export class UpdateFichaMinimaDto {
  @IsString()
  @IsOptional()
  tallaId?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsEnum(GeneroEnum)
  @IsOptional()
  genero?: GeneroEnum;

  @IsString()
  @IsOptional()
  nombreEnPrenda?: string;
}
