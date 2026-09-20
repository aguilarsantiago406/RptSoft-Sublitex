import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoTarifa } from '@prisma/client';

export class CreateTarifaDto {
  @ApiProperty({ enum: TipoTarifa, example: TipoTarifa.PRODUCTO })
  @IsEnum(TipoTarifa)
  tipo: TipoTarifa;

  @ApiProperty({ example: 'Kit completo' })
  @IsString()
  @IsNotEmpty()
  concepto: string;

  @ApiProperty({ example: 150.00, description: 'Valor positivo mayor a cero' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  valor: number;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  @IsDateString()
  vigenteDesde: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  vigenteHasta?: string;

  @ApiPropertyOptional({ example: 'Tarifa base para kit completo' })
  @IsOptional()
  @IsString()
  nota?: string;
}
