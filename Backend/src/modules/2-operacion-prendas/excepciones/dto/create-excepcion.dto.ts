import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExcepcionDto {
  @IsString()
  @IsNotEmpty()
  prendaId: string;

  @IsString()
  @IsNotEmpty()
  atributoId: string;

  @IsString()
  @IsNotEmpty()
  valorAtributoId: string;

  @IsString()
  @IsNotEmpty({ message: 'El motivo de la excepción es obligatorio (R-C04).' })
  motivo: string;
}
