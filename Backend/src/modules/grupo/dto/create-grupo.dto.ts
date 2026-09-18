import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PoliticaNumeracion {
  LIBRE = 'LIBRE',
  UNICA = 'UNICA',
}

export class CreateGrupoDto {
  @ApiProperty({ example: 'Conjunto Titular Alumnos' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    enum: PoliticaNumeracion,
    description: 'LIBRE = números pueden repetirse (promos). UNICA = números irrepetibles (R-G01).',
    example: PoliticaNumeracion.LIBRE,
  })
  @IsEnum(PoliticaNumeracion)
  politicaNumeracion: PoliticaNumeracion;

  @ApiProperty({ example: 'cuid_tipo_producto', description: 'ID del TipoProducto (piezas físicas R-K03)' })
  @IsString()
  @IsNotEmpty()
  tipoProductoId: string;

  @ApiProperty({ example: 28, description: 'Cantidad contratada comercialmente (R-B02)' })
  @IsInt()
  @Min(1)
  cantidadContratada: number;

  @ApiPropertyOptional({ example: 'Con escudo al frente' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}