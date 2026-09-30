import { IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePedidoDto {
  @ApiPropertyOptional({ example: '2026-12-31T00:00:00Z', description: 'Nueva fecha de compromiso (R-A09)' })
  @IsOptional()
  @IsDateString()
  fechaCompromiso?: string;

  @ApiPropertyOptional({ example: 'cuid_de_la_vendedora', description: 'Reasignar asesora vendedora' })
  @IsOptional()
  @IsString()
  vendedoraId?: string;

  @ApiPropertyOptional({ example: 'cuid_del_vendedor', description: 'Alias opcional de vendedoraId' })
  @IsOptional()
  @IsString()
  vendedorId?: string;

  @ApiPropertyOptional({ example: 'Entrega con urgencia para desfile' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
