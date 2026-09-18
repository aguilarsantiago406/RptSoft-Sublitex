import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddColorDto {
  @ApiProperty({ example: 'Azul Marino Oficial' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: '#001489', description: 'Codigo hex obligatorio (R-K05)' })
  @IsString()
  @Matches(/^#([0-9A-Fa-f]{6})$/, { message: 'codigoHex debe ser #RRGGBB valido' })
  codigoHex: string;

  @ApiPropertyOptional({ example: 'Azul Marino Pantone 287C' })
  @IsOptional()
  @IsString()
  referenciaFisica?: string;
}
