import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoTarifa } from '@prisma/client';
import { PartialType } from '@nestjs/swagger';
import { CreateTarifaDto } from './create-tarifa.dto';

export class UpdateTarifaDto extends PartialType(CreateTarifaDto) {}