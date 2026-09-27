"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { BicyclePicker } from "@/components/loans/bicycle-picker";
import { loanFormSchema, type LoanFormInput } from "@/lib/validation/loan";
import { useClientByDocument, useCreateLoan } from "@/hooks/use-loans";
import { ClientApiError } from "@/lib/api/client-fetch";

export default function NewLoanPage() {
  const router = useRouter();
  const [lookupState, setLookupState] = useState<"idle" | "found" | "new">("idle");
  const clientLookup = useClientByDocument();
  const createLoan = useCreateLoan();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoanFormInput>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: { client: { full_name: "", document: "", phone: "" }, bicycle_ids: [] },
  });

  async function handleDocumentBlur(document: string) {
    if (!/^\d{6,14}$/.test(document)) return;
    try {
      const client = await clientLookup.mutateAsync(document);
      setValue("client.full_name", client.full_name);
      setValue("client.phone", client.phone);
      setLookupState("found");
    } catch {
      setLookupState("new");
    }
  }

  async function onSubmit(data: LoanFormInput) {
    try {
      const loan = await createLoan.mutateAsync(data);
      toast.success(`Préstamo registrado para ${data.client.full_name}`);
      router.push(`/prestamos/${loan.id}`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo registrar el préstamo");
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Registrar préstamo</h1>
        <p className="text-sm text-muted-foreground">
          La fecha y hora se registran automáticamente al guardar.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field
          label="Documento del cliente"
          htmlFor="document"
          error={errors.client?.document?.message}
          hint={
            lookupState === "found"
              ? "Cliente encontrado: datos completados automáticamente"
              : lookupState === "new"
                ? "Cliente nuevo: completa sus datos"
                : undefined
          }
        >
          <Input
            id="document"
            inputMode="numeric"
            {...register("client.document", {
              onBlur: (e) => handleDocumentBlur(e.target.value),
            })}
          />
        </Field>

        <Field label="Nombre completo" htmlFor="full_name" error={errors.client?.full_name?.message}>
          <Input id="full_name" {...register("client.full_name")} />
        </Field>

        <Field label="Celular" htmlFor="phone" error={errors.client?.phone?.message}>
          <Input id="phone" inputMode="tel" {...register("client.phone")} />
        </Field>

        <Field label="Bicicletas" htmlFor="bicycles" error={errors.bicycle_ids?.message}>
          <Controller
            name="bicycle_ids"
            control={control}
            render={({ field }) => <BicyclePicker selected={field.value} onChange={field.onChange} />}
          />
        </Field>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Registrar préstamo
          </Button>
        </div>
      </form>
    </div>
  );
}
