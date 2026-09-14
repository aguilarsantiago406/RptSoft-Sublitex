import { Module } from '@nestjs/common';
import { PersonalizacionesController } from './personalizaciones.controller';
import { PersonalizacionesService } from './personalizaciones.service';

@Module({
  controllers: [PersonalizacionesController],
  providers: [PersonalizacionesService],
  exports: [PersonalizacionesService],
})
export class PersonalizacionesModule {}
