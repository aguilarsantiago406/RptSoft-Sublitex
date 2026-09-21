import { Module } from '@nestjs/common';
import { DisenoController } from './diseno.controller';
import { DisenoService } from './diseno.service';

@Module({
  controllers: [DisenoController],
  providers: [DisenoService],
  exports: [DisenoService],
})
export class DisenoModule {}
