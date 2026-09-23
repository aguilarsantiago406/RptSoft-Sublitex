import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolUsuario } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@sublitex.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ enum: RolUsuario, example: RolUsuario.VENDEDORA })
  @IsEnum(RolUsuario)
  rol: RolUsuario;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  activo?: boolean;
}
