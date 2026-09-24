import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CrearNestingParteDto {
  @ApiProperty({ description: 'Pedido al que se carga esta parte (R-K11)' })
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @ApiProperty({
    description: 'Ancho realmente ocupado en cm (R-K11: 1..180, ancho 1.80 m)',
    minimum: 1,
    maximum: 180,
  })
  @IsInt()
  @Min(1)
  @Max(180)
  anchoCm: number;

  @ApiProperty({ description: 'Largo ocupado en cm (R-K11: > 0)', minimum: 1 })
  @IsInt()
  @Min(1)
  largoCm: number;

  @ApiPropertyOptional({
    description: 'True si esta parte es de rib (se reporta aparte)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esRib?: boolean;
}
