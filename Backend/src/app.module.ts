import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { NucleoComercialModule } from './modules/1-nucleo-comercial/nucleo-comercial.module';
import { OperacionPrendasModule } from './modules/2-operacion-prendas/operacion-prendas.module';
import { DominioDisenoModule } from './modules/3-diseno/dominio-diseno.module';
import { TallerProduccionModule } from './modules/4-taller-produccion/taller-produccion.module';
import { DominioAuditoriaModule } from './modules/5-auditoria/dominio-auditoria.module';

@Module({
  imports: [
    PrismaModule,
    NucleoComercialModule,
    OperacionPrendasModule,
    DominioDisenoModule,
    TallerProduccionModule,
    DominioAuditoriaModule,
  ],
})
export class AppModule {}
