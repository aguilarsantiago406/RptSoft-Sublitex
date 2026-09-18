import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ClienteModule } from './modules/cliente/cliente.module';
import { PedidoModule } from './modules/pedido/pedido.module';
import { GrupoModule } from './modules/grupo/grupo.module';
import { CatalogoModule } from './modules/catalogo/catalogo.module';

@Module({
  imports: [PrismaModule, ClienteModule, PedidoModule, GrupoModule, CatalogoModule],
})
export class AppModule {}
