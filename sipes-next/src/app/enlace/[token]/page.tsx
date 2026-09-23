import { redirect } from "next/navigation";

interface EnlacePageProps {
  params: Promise<{ token: string }>;
}

export default async function EnlaceRedirectPage({ params }: EnlacePageProps) {
  const { token } = await params;
  redirect(`/participante/${encodeURIComponent(token)}`);
}
