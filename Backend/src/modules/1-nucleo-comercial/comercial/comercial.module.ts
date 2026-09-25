import { Module } from '@nestjs/common';
import { ComercialController } from './comercial.controller';
import { ComercialService } from './comercial.service';
import { PdfModule } from '../../../core/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ComercialController],
  providers: [ComercialService],
  exports: [ComercialService],
})
export class ComercialModule {}
