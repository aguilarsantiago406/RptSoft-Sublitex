import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GeneroEnum {
  HOMBRE = 'HOMBRE',
  MUJER = 'MUJER',
  NINO = 'NINO',
  NINA = 'NINA',
  SIN_ESPECIFICAR = 'SIN_ESPECIFICAR',
}

export class PersonalizacionFichaDto {
  @IsString()
  @IsNotEmpty()
  ubicacionId: string;

  @IsString()
  @IsNotEmpty()
  contenido: string;
}

export class PrendaFichaDto {
  @IsString()
  @IsNotEmpty()
  prendaId: string;

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizacionFichaDto)
  @IsOptional()
  personalizaciones?: PersonalizacionFichaDto[];
}

export class GuardarFichaEnlaceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrendaFichaDto)
  prendas: PrendaFichaDto[];
}
