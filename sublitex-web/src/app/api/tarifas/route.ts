import { NextResponse } from "next/server";
import { tarifasVigentesMock } from "@/services/tarifasMock";

/**
 * GET /api/tarifas
 * Devuelve el tarifario general vigente de Sublitex
 */
export async function GET() {
  return NextResponse.json(tarifasVigentesMock);
}
