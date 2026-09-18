import { Module } from '@nestjs/common';
import { DisenoModule } from './diseno/diseno.module';

@Module({
  imports: [DisenoModule],
  exports: [DisenoModule],
})
export class DominioDisenoModule {}
