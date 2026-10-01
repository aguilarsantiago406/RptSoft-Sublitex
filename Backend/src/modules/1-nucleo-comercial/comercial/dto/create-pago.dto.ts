import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedioPago } from '@prisma/client';

export class CreatePagoDto {
  @ApiProperty({ example: 450.0, description: 'Monto del pago o abono parcial' })
  @IsNumber()
  @IsPositive({ message: 'El monto debe ser un valor positivo mayor a 0' })
  monto: number;

  @ApiProperty({ enum: MedioPago, example: MedioPago.YAPE, description: 'Medio de pago utilizado' })
  @IsEnum(MedioPago, { message: 'El medio de pago debe ser YAPE, PLIN, TRANSFERENCIA o EFECTIVO' })
  medio: MedioPago;

  @ApiPropertyOptional({ example: '1234567890', description: 'Número de operación o constancia' })
  @IsOptional()
  @IsString()
  numeroOperacion?: string;

  @ApiPropertyOptional({ example: 'https://storage.../comprobante.jpg', description: 'URL del comprobante o captura' })
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @ApiPropertyOptional({ example: '2026-10-01T12:00:00Z', description: 'Fecha del pago' })
  @IsOptional()
  @IsString()
  fechaPago?: string;

  @ApiPropertyOptional({ example: 'Segundo abono antes de estampado', description: 'Notas u observaciones del pago' })
  @IsOptional()
  @IsString()
  notas?: string;
}
