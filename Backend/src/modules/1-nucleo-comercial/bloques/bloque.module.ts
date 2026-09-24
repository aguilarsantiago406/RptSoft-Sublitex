import { Module } from '@nestjs/common';
import { BloqueController } from './bloque.controller';
import { BloqueService } from './bloque.service';

@Module({
  controllers: [BloqueController],
  providers: [BloqueService],
  exports: [BloqueService],
})
export class BloqueModule {}
