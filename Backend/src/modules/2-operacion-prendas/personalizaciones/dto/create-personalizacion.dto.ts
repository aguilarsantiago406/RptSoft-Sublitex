import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePersonalizacionDto {
  @IsString()
  @IsNotEmpty()
  prendaId: string;

  @IsString()
  @IsNotEmpty({ message: 'La ubicación es obligatoria (R-F03).' })
  ubicacionId: string;

  @IsString()
  @IsNotEmpty({ message: 'El contenido del estampado es obligatorio.' })
  contenido: string;
}
