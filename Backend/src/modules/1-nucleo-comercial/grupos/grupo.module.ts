import { Module } from '@nestjs/common';
import { GrupoController } from './grupo.controller';
import { GrupoService } from './grupo.service';

@Module({
  controllers: [GrupoController],
  providers: [GrupoService],
})
export class GrupoModule {}
