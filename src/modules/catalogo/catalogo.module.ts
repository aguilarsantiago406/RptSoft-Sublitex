import { Module } from '@nestjs/common';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { TipoProductoController } from './tipo-producto.controller';

@Module({
  controllers: [CatalogoController, TipoProductoController],
  providers: [CatalogoService],
})
export class CatalogoModule {}