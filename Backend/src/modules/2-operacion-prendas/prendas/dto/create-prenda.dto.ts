import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GeneroEnum } from '../../participantes/dto/guardar-ficha-enlace.dto';

export enum TipoPrendaEnum {
  VENTA = 'VENTA',
  OBSEQUIO = 'OBSEQUIO',
  MUESTRA = 'MUESTRA',
}

export class CreatePrendaDto {
  @IsString()
  @IsNotEmpty()
  participanteId: string;

  @IsString()
  @IsNotEmpty()
  grupoId: string;

  @IsString()
  @IsNotEmpty()
  tipoProductoId: string;

  @IsString()
  @IsOptional()
  tallaId?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsEnum(GeneroEnum)
  @IsOptional()
  genero?: GeneroEnum;

  @IsEnum(TipoPrendaEnum)
  @IsOptional()
  tipoPrenda?: TipoPrendaEnum;

  @IsString()
  @IsOptional()
  colorId?: string;

  @IsString()
  @IsOptional()
  nombreEnPrenda?: string;

  @IsBoolean()
  @IsOptional()
  esArquero?: boolean;
}
