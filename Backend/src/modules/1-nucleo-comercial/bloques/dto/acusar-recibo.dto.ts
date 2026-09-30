import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum AreaAcuse {
  DISENO = 'DISENO',
  PRODUCCION = 'PRODUCCION',
  AMBAS = 'AMBAS',
}

export class AcusarReciboDto {
  @ApiPropertyOptional({
    enum: AreaAcuse,
    description:
      'Área que acusa recibo formal (DISENO, PRODUCCION o AMBAS). Si se omite, se deduce automáticamente del rol del usuario autenticado.',
    example: AreaAcuse.PRODUCCION,
  })
  @IsOptional()
  @IsEnum(AreaAcuse, {
    message: 'El área debe ser DISENO, PRODUCCION o AMBAS',
  })
  area?: AreaAcuse;

  @ApiPropertyOptional({
    description: 'Nota u observación opcional del acuse de recibo',
    example: 'Enterado del cambio de talla en reapertura v2, se ajusta el molde.',
  })
  @IsOptional()
  @IsString()
  nota?: string;
}
