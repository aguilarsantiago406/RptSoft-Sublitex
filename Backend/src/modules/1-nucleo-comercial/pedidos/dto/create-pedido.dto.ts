import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePedidoDto {
  @ApiProperty({ example: 'cuid_del_cliente', description: 'ID interno del cliente' })
  @IsString()
  @IsNotEmpty()
  clienteId: string;

  @ApiProperty({ example: '2026-10-15T00:00:00Z', description: 'Debe ser posterior a hoy (R-A09)' })
  @IsDateString()
  fechaCompromiso: string;

  @ApiPropertyOptional({ example: 'cuid_de_la_vendedora', description: 'ID de la asesora/vendedora asignada' })
  @IsOptional()
  @IsString()
  vendedoraId?: string;

  @ApiPropertyOptional({ example: 'cuid_del_vendedor', description: 'Alias opcional de vendedoraId' })
  @IsOptional()
  @IsString()
  vendedorId?: string;

  @ApiPropertyOptional({ example: 'Entrega prioritaria para desfile escolar' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
