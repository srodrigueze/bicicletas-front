"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/validation/auth";
import { apiFetch, ClientApiError } from "@/lib/api/client-fetch";

/** Changing the password bumps the backend's token_version, which revokes the
 * token this session is using. So on success we drop the cookie and send the
 * user back to /login instead of leaving them on a session that would 401. */
export function ChangePasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await apiFetch("/api/users/me/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: data.current_password, new_password: data.new_password }),
      });
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo actualizar la contraseña");
      return;
    }

    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    toast.success("Contraseña actualizada. Inicia sesión con tu nueva contraseña.");
    router.push("/login");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 rounded-md border border-border bg-card p-4"
      noValidate
    >
      <h2 className="text-sm font-medium">Cambiar contraseña</h2>

      <Field label="Contraseña actual" htmlFor="current_password" error={errors.current_password?.message}>
        <Input id="current_password" type="password" autoComplete="current-password" {...register("current_password")} />
      </Field>

      <Field label="Nueva contraseña" htmlFor="new_password" error={errors.new_password?.message}>
        <Input id="new_password" type="password" autoComplete="new-password" {...register("new_password")} />
      </Field>

      <Field label="Confirmar nueva contraseña" htmlFor="confirm_password" error={errors.confirm_password?.message}>
        <Input id="confirm_password" type="password" autoComplete="new-password" {...register("confirm_password")} />
      </Field>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Actualizar contraseña
      </Button>
    </form>
  );
}
