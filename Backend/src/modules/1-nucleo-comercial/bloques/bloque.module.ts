import { Module } from '@nestjs/common';
import { BloqueController } from './bloque.controller';
import { BloqueService } from './bloque.service';
import { AuditoriaModule } from '../../5-auditoria/auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  controllers: [BloqueController],
  providers: [BloqueService],
  exports: [BloqueService],
})
export class BloqueModule {}
