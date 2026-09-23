import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDatosEnvioDto {
  @ApiProperty({ example: 'Juan Perez Garcia' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  nombreCompleto: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(7)
  @MaxLength(20)
  dni: string;

  @ApiProperty({ example: '+51 999 888 777' })
  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(20)
  celular: string;

  @ApiProperty({ example: 'Lima' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  ciudad: string;

  @ApiProperty({ example: 'Olva Courier' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  agencia: string;

  @ApiPropertyOptional({ example: 'Referencia: Plaza principal' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  referencia?: string;

  @ApiPropertyOptional({ example: 'juan@empresa.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  correo?: string;
}
