import { KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

/** Shown instead of the app while the backend flags the account as
 * must_change_password: every other endpoint answers 403 until it's cleared,
 * so rendering the app would only produce a screen of failed requests. */
export function ForcePasswordChange({ fullName }: { fullName: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <KeyRound className="size-6" />
          </span>
          <div>
            <h1 className="text-lg font-semibold">Hola, {fullName}</h1>
            <p className="text-sm text-muted-foreground">
              Por seguridad, debes cambiar tu contraseña antes de continuar. Después tendrás que volver a ingresar.
            </p>
          </div>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
