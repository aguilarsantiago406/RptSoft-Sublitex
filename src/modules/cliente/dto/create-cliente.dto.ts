import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoCliente {
  COLEGIO = 'COLEGIO',
  PROMOCION = 'PROMOCION',
  CLUB = 'CLUB',
  EMPRESA = 'EMPRESA',
  PARTICULAR = 'PARTICULAR',
}

export class CreateClienteDto {
  @ApiProperty({ example: 'Colegio San Agustin - Promo 2002' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({ example: '999888777' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'Lima' })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({ enum: TipoCliente, example: TipoCliente.PROMOCION })
  @IsEnum(TipoCliente)
  tipo: TipoCliente;
}
