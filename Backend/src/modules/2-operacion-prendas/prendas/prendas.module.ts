import { Module } from '@nestjs/common';
import { PrendasController } from './prendas.controller';
import { PrendasService } from './prendas.service';

@Module({
  controllers: [PrendasController],
  providers: [PrendasService],
  exports: [PrendasService],
})
export class PrendasModule {}
