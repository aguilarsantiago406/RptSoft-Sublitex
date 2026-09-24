import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReabrirBloqueDto {
  @ApiProperty({
    example: 'Cliente solicita cambio de tallas y agregado de arquero',
    description: 'Motivo obligatorio de la reapertura (R-H13)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  motivoReapertura: string;
}
