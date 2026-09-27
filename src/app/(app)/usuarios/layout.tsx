import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session?.role !== "administrador") {
    redirect("/prestamos");
  }
  return children;
}
