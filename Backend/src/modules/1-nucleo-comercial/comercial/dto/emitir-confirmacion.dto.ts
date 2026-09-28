import { IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoComprobante } from '@prisma/client';

export class EmitirConfirmacionDto {
  @ApiPropertyOptional({ example: 500, description: 'Monto de adelanto recibido registrado' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adelantoRecibido?: number;

  @ApiPropertyOptional({ enum: TipoComprobante, default: TipoComprobante.NINGUNO })
  @IsOptional()
  @IsEnum(TipoComprobante)
  comprobante?: TipoComprobante;

  @ApiPropertyOptional({ example: 25.0, description: 'Recargos por tallas especiales (R-H07)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recargoTallas?: number;

  @ApiPropertyOptional({ example: 30.0, description: 'Recargos por telas especiales (R-H08)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recargoTelas?: number;

  @ApiPropertyOptional({ example: 15.0, description: 'Recargos por cuellos especiales' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recargoCuellos?: number;

  @ApiPropertyOptional({ example: 10.0, description: 'Recargos por acabados especiales' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recargoAcabados?: number;

  @ApiPropertyOptional({ example: 40.0, description: 'Importes adicionales' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  adicionales?: number;
}
