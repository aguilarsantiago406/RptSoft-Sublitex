import { Module } from '@nestjs/common';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  exports: [AuditoriaModule],
})
export class DominioAuditoriaModule {}
