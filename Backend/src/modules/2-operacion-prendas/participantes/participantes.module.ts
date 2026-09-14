import { Module } from '@nestjs/common';
import { ParticipantesController } from './participantes.controller';
import { ParticipantesPublicController } from './participantes-public.controller';
import { ParticipantesService } from './participantes.service';

@Module({
  controllers: [ParticipantesController, ParticipantesPublicController],
  providers: [ParticipantesService],
  exports: [ParticipantesService],
})
export class ParticipantesModule {}
