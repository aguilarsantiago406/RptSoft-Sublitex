import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearDisenoDto {
  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @IsString()
  @IsOptional()
  archivoUrl?: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}
