import { IsString, IsNotEmpty, IsOptional, Matches, IsInt, Min, Max } from 'class-validator';
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

  @ApiPropertyOptional({ example: 100, description: 'Cian (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cmykC?: number;

  @ApiPropertyOptional({ example: 85, description: 'Magenta (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cmykM?: number;

  @ApiPropertyOptional({ example: 5, description: 'Amarillo (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cmykY?: number;

  @ApiPropertyOptional({ example: 20, description: 'Negro (0-100)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  cmykK?: number;
}
