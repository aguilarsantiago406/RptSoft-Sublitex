import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CatalogosModule } from './catalogos/catalogos.module';
import { GruposModule } from './grupos/grupos.module';
import { ComercialModule } from './comercial/comercial.module';

@Module({
  imports: [
    AuthModule,
    ClientesModule,
    PedidosModule,
    CatalogosModule,
    GruposModule,
    ComercialModule,
  ],
  exports: [
    AuthModule,
    ClientesModule,
    PedidosModule,
    CatalogosModule,
    GruposModule,
    ComercialModule,
  ],
})
export class NucleoComercialModule {}
