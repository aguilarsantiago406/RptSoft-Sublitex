import { redirect } from "next/navigation";
import { getSessionToken } from "@/lib/auth/session";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  if (await getSessionToken()) {
    redirect("/pedidos");
  }

  return <LoginForm />;
}