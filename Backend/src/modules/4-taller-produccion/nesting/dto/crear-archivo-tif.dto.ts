import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearArchivoTifDto {
  @ApiProperty({
    description:
      'Nombre con formato SUBLITEX_{PEDIDO}_{TELA}_{ANCHO}x_{LARGO}_{orden}de{total}.tif (R-K13)',
    example: 'SUBLITEX_PROMO2002_DRYFIT_180x400_1de3.tif',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Largo del archivo en metros (R-K13: máximo 5.00 m)',
    example: 4.0,
    maximum: 5.0,
  })
  @IsNumber()
  @Min(0.01)
  @Max(5.0, { message: 'El largo máximo por archivo TIF es de 5 metros (R-K13)' })
  largoM: number;

  @ApiProperty({ description: 'Posición en la serie (>= 1)', minimum: 1 })
  @IsInt()
  @Min(1)
  ordenEnSerie: number;

  @ApiProperty({
    description: 'Total de piezas de la serie (>= 1)',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  totalSerie: number;

  @ApiPropertyOptional({ description: 'Fecha de entrega al taller' })
  @IsOptional()
  @IsDateString()
  entregadoEn?: string;
}
