import { IsString, IsOptional, IsEnum, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PoliticaNumeracion } from './create-grupo.dto';

export class ConfiguracionItemDto {
  @ApiPropertyOptional({ description: 'ID del Atributo (ej. TELA, CORTE, MANGA)', example: 'cuid_atributo' })
  @IsString()
  atributoId: string;

  @ApiPropertyOptional({ description: 'ID del ValorAtributo (ej. ALGODON, FEMENINO)', example: 'cuid_valor' })
  @IsString()
  valorAtributoId: string;
}

export class UpdateGrupoDto {
  @ApiPropertyOptional({ example: 'Conjunto Titular Alumnos Actualizado' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({
    enum: PoliticaNumeracion,
    description: 'LIBRE = numeros pueden repetirse. UNICA = numeros irrepetibles (R-G01).',
    example: PoliticaNumeracion.UNICA,
  })
  @IsOptional()
  @IsEnum(PoliticaNumeracion)
  politicaNumeracion?: PoliticaNumeracion;

  @ApiPropertyOptional({ example: 'cuid_otro_tipo_producto' })
  @IsOptional()
  @IsString()
  tipoProductoId?: string;

  @ApiPropertyOptional({ example: 30, description: 'Cantidad contratada comercialmente (R-B02)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cantidadContratada?: number;

  @ApiPropertyOptional({ example: 'Cambio de politica a numeros unicos' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Configuracion general del grupo (R-B03, R-B07). Cada item es un atributo con su valor seleccionado.',
    type: [ConfiguracionItemDto],
    example: [
      { atributoId: 'cuid_atributo_tela', valorAtributoId: 'cuid_valor_algodon' },
      { atributoId: 'cuid_atributo_corte', valorAtributoId: 'cuid_valor_femenino' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfiguracionItemDto)
  configuracion?: ConfiguracionItemDto[];
}
