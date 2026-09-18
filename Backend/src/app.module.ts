import { Module } from '@nestjs/common';
import { PrismaModule } from './core/prisma/prisma.module';
import { NucleoComercialModule } from './modules/1-nucleo-comercial/nucleo-comercial.module';
import { OperacionPrendasModule } from './modules/2-operacion-prendas/operacion-prendas.module';

@Module({
  imports: [
    PrismaModule,
    NucleoComercialModule,
    OperacionPrendasModule,
  ],
})
export class AppModule {}