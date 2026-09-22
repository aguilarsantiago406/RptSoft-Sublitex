import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getSessionToken } from "@/lib/auth/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const sesion = await getSessionToken();
  if (!sesion) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
