"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { getAuthToken } from "@/services/apiClient";
import styles from "./layout.module.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sesionOk, setSesionOk] = useState(false);

  // Guard de sesión: solo redirige en el cliente, sin mirar cookies.
  useEffect(() => {
    if (getAuthToken()) {
      setSesionOk(true);
      return;
    }
    router.replace("/login");
  }, [router]);

  // Sin token no renderizamos el shell hasta el redirect (evita el flash).
  if (!sesionOk) return null;

  return (
    <>
      <Sidebar />
      <div className={styles.contenido}>{children}</div>
    </>
  );
}