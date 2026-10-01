import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateParticipanteDto {
  @ApiProperty({
    description: 'Nombre de la persona (R-D02).',
    example: 'Juan Carlos Pérez',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la persona no puede estar vacío.' })
  nombrePersona: string;
}
