import { IsNotEmpty, IsString } from 'class-validator';

export class CreateParticipanteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la persona no puede estar vacío.' })
  nombrePersona: string;
}
