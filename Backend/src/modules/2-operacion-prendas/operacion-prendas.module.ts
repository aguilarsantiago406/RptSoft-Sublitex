import { Module } from '@nestjs/common';
import { ParticipantesModule } from './participantes/participantes.module';
import { PrendasModule } from './prendas/prendas.module';
import { ExcepcionesModule } from './excepciones/excepciones.module';
import { PersonalizacionesModule } from './personalizaciones/personalizaciones.module';

@Module({
  imports: [
    ParticipantesModule,
    PrendasModule,
    ExcepcionesModule,
    PersonalizacionesModule,
  ],
  exports: [
    ParticipantesModule,
    PrendasModule,
    ExcepcionesModule,
    PersonalizacionesModule,
  ],
})
export class OperacionPrendasModule {}
