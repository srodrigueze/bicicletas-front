import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { SessionProvider } from "@/lib/session-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { ForcePasswordChange } from "@/components/auth/force-password-change";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (session.mustChangePassword) {
    return <ForcePasswordChange fullName={session.fullName} />;
  }

  return (
    <SessionProvider session={session}>
      <QueryProvider>
        <AppShell>{children}</AppShell>
      </QueryProvider>
    </SessionProvider>
  );
}
