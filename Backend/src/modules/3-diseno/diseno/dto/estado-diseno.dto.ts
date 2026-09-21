import { IsOptional, IsString } from 'class-validator';

export class EstadoDisenoDto {
  @IsString()
  @IsOptional()
  usuarioId?: string;

  @IsString()
  @IsOptional()
  motivo?: string;
}
