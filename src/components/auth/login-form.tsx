"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Bike, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { apiFetch, ClientApiError } from "@/lib/api/client-fetch";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    setFormError(null);
    try {
      await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      if (err instanceof ClientApiError) {
        setFormError(err.status === 401 ? "Documento o contraseña incorrectos" : err.message);
      } else {
        setFormError("No se pudo conectar con el servidor");
      }
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Bike className="size-6" />
        </span>
        <div>
          <h1 className="text-lg font-semibold">Inventario de Bicicletas</h1>
          <p className="text-sm text-muted-foreground">Junta de Acción Comunal · Jornada de ciclovía</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Número de documento" htmlFor="document" error={errors.document?.message}>
          <Input
            id="document"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Ej: 1017123456"
            autoFocus
            {...register("document")}
          />
        </Field>

        <Field
          label="Contraseña"
          htmlFor="password"
          error={errors.password?.message}
          hint="Los últimos 4 dígitos de tu documento"
        >
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
        </Field>

        {formError ? (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Ingresar
        </Button>
      </form>
    </div>
  );
}
