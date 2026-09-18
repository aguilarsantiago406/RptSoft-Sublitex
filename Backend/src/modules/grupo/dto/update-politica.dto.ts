import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PoliticaNumeracion } from './create-grupo.dto';

export class UpdatePoliticaDto {
  @ApiProperty({
    enum: PoliticaNumeracion,
    description: 'LIBRE o UNICA. El trigger de la BD propaga el cambio a las prendas (R-G01).',
    example: PoliticaNumeracion.LIBRE,
  })
  @IsEnum(PoliticaNumeracion)
  politicaNumeracion: PoliticaNumeracion;
}