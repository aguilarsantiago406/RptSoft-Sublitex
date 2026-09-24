import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EstadoDisenoDto {
  @ApiPropertyOptional({ description: 'ID del usuario que aprueba o rechaza (se toma del JWT si se omite)' })
  @IsOptional()
  @IsString()
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Motivo explicativo si se rechaza el diseño' })
  @IsOptional()
  @IsString()
  motivo?: string;
}
