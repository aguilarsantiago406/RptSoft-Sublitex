import { IsOptional, IsString } from 'class-validator';

export class ActualizarArtefactosDto {
  @IsString()
  @IsOptional()
  archivoUrl?: string;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
}
