import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { GeneroEnum } from '../../participantes/dto/guardar-ficha-enlace.dto';
import { TipoPrendaEnum } from './create-prenda.dto';

export class UpdateFichaMinimaDto {
  @IsString()
  @IsOptional()
  tallaId?: string;

  @IsString()
  @IsOptional()
  tallaShortId?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsEnum(GeneroEnum)
  @IsOptional()
  genero?: GeneroEnum;

  @IsString()
  @IsOptional()
  nombreEnPrenda?: string;

  @IsString()
  @IsOptional()
  colorId?: string;

  @IsEnum(TipoPrendaEnum)
  @IsOptional()
  tipoPrenda?: TipoPrendaEnum;

  @IsBoolean()
  @IsOptional()
  esArquero?: boolean;
}
