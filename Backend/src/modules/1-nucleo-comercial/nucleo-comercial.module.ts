import { Module } from '@nestjs/common';
import { ClienteModule } from './clientes/cliente.module';
import { PedidoModule } from './pedidos/pedido.module';
import { GrupoModule } from './grupos/grupo.module';
import { CatalogoModule } from './catalogos/catalogo.module';

@Module({
  imports: [ClienteModule, PedidoModule, GrupoModule, CatalogoModule],
  exports: [ClienteModule, PedidoModule, GrupoModule, CatalogoModule],
})
export class NucleoComercialModule {}