-- AlterTable: agregar talla del short diferenciada por componente en un conjunto
ALTER TABLE "Prenda" ADD COLUMN "tallaShortId" TEXT;

-- AddForeignKey
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_tipoProductoId_tallaShortId_fkey"
  FOREIGN KEY ("tipoProductoId", "tallaShortId")
  REFERENCES "TallaCatalogo"("tipoProductoId", "id")
  ON DELETE SET NULL ON UPDATE CASCADE;
