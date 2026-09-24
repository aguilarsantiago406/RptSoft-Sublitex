import { Module } from '@nestjs/common';
import { AuditoriaModule } from '../../5-auditoria/auditoria/auditoria.module';
import { NestingController } from './nesting.controller';
import { NestingService } from './nesting.service';

@Module({
  imports: [AuditoriaModule],
  controllers: [NestingController],
  providers: [NestingService],
  exports: [NestingService],
})
export class NestingModule {}
