import { NextResponse } from "next/server";
import { catalogoMock } from "@/services/catalogoMock";

/**
 * GET /api/catalogos — contrato §2.1
 * Catálogo oficial: productos con BOM (R-K03), tallas por producto (R-E04)
 * y atributos con sus valores cerrados (R-B04). Sin precios (R-K10).
 */
export async function GET() {
  return NextResponse.json(catalogoMock);
}