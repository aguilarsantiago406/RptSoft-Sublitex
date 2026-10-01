import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/auth/session";

const DEFAULT_API_URL = "http://localhost:3001";

function getApiUrl() {
  return (process.env.SIPES_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = await getSessionToken();

  const backendRes = await fetch(`${getApiUrl()}/api/pedidos/${encodeURIComponent(id)}/export-diseno`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return new NextResponse("Error al generar la exportación para diseño", {
      status: backendRes.status,
    });
  }

  const csvText = await backendRes.text();
  const contentDisposition =
    backendRes.headers.get("content-disposition") ||
    `attachment; filename="EXPORT_COREL_${id}.csv"`;

  return new NextResponse(csvText, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": contentDisposition,
    },
  });
}
