import { Module } from '@nestjs/common';
import { ExcepcionesController } from './excepciones.controller';
import { ExcepcionesService } from './excepciones.service';

@Module({
  controllers: [ExcepcionesController],
  providers: [ExcepcionesService],
  exports: [ExcepcionesService],
})
export class ExcepcionesModule {}
