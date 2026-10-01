import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CargaMasivaFilaDto {
  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  apodo?: string;

  @IsString()
  @IsOptional()
  talla?: string;

  @IsString()
  @IsOptional()
  tallaShort?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  genero?: string;

  @IsString()
  @IsOptional()
  tipoPrenda?: string;

  @IsBoolean()
  @IsOptional()
  esArquero?: boolean;
}

export class CargaMasivaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CargaMasivaFilaDto)
  filas: CargaMasivaFilaDto[];
}
