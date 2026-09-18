import { Module } from '@nestjs/common';
import { NestingModule } from './nesting/nesting.module';

@Module({
  imports: [NestingModule],
  exports: [NestingModule],
})
export class TallerProduccionModule {}
