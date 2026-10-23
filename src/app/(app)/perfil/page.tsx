"use client";

import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { useSession } from "@/lib/session-context";
import { USER_ROLE_LABELS } from "@/lib/format";

export default function ProfilePage() {
  const session = useSession();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          {session.fullName} · {USER_ROLE_LABELS[session.role]}
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
