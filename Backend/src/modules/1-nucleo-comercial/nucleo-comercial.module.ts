import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ClienteModule } from './clientes/cliente.module';
import { PedidoModule } from './pedidos/pedido.module';
import { GrupoModule } from './grupos/grupo.module';
import { CatalogoModule } from './catalogos/catalogo.module';
import { ComercialModule } from './comercial/comercial.module';

@Module({
  imports: [
    AuthModule,
    ClienteModule,
    PedidoModule,
    GrupoModule,
    CatalogoModule,
    ComercialModule,
  ],
  exports: [
    AuthModule,
    ClienteModule,
    PedidoModule,
    GrupoModule,
    CatalogoModule,
    ComercialModule,
  ],
})
export class NucleoComercialModule {}