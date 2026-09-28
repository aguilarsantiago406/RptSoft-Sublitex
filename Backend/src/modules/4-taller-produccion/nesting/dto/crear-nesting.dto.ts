import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearNestingDto {
  @ApiProperty({
    description:
      'Código legible del nesting (R-A03 style), único en todo el sistema',
    example: 'NEST-2002-01',
  })
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @ApiProperty({
    description:
      'Valor de atributo del catálogo (TELA) sobre el que se imprime',
  })
  @IsString()
  @IsNotEmpty()
  telaId: string;

  @ApiPropertyOptional({ description: 'Usuario que crea el nesting (se toma del JWT si se omite)' })
  @IsString()
  @IsOptional()
  creadoPorId?: string;
}
