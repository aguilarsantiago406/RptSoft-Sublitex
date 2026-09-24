import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../../5-auditoria/auditoria/auditoria.module';
import { DisenoController } from './diseno.controller';
import { DisenoService } from './diseno.service';

@Module({
  imports: [AuditoriaModule],
  controllers: [DisenoController],
  providers: [DisenoService],
  exports: [DisenoService],
})
export class DisenoModule {}
