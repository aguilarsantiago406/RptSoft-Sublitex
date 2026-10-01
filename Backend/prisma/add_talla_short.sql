ALTER TABLE "Prenda" ADD COLUMN IF NOT EXISTS "tallaShortId" TEXT;
ALTER TABLE "Prenda" DROP CONSTRAINT IF EXISTS "Prenda_tipoProductoId_tallaShortId_fkey";
ALTER TABLE "Prenda" ADD CONSTRAINT "Prenda_tipoProductoId_tallaShortId_fkey" FOREIGN KEY ("tipoProductoId", "tallaShortId") REFERENCES "TallaCatalogo"("tipoProductoId", "id") ON DELETE SET NULL ON UPDATE CASCADE;
