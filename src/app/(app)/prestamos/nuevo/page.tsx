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
import { ClientSearchCombobox } from "@/components/loans/client-search-combobox";
import { loanFormSchema, type LoanFormInput } from "@/lib/validation/loan";
import { useCreateLoan } from "@/hooks/use-loans";
import { ClientApiError } from "@/lib/api/client-fetch";

export default function NewLoanPage() {
  const router = useRouter();
  const [justSelected, setJustSelected] = useState(false);
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
          hint={justSelected ? "Cliente encontrado: datos completados automáticamente, puedes editarlos" : undefined}
        >
          <Controller
            name="client.document"
            control={control}
            render={({ field }) => (
              <ClientSearchCombobox
                id="document"
                inputValue={field.value}
                onInputValueChange={(text) => {
                  setJustSelected(false);
                  field.onChange(text);
                }}
                onSelectClient={(client) => {
                  field.onChange(client.document);
                  setValue("client.full_name", client.full_name);
                  setValue("client.phone", client.phone);
                  setJustSelected(true);
                }}
              />
            )}
          />
        </Field>

        <Field label="Nombre completo" htmlFor="full_name" error={errors.client?.full_name?.message}>
          <Input
            id="full_name"
            {...register("client.full_name")}
            onChange={(e) => {
              // Strip anything that isn't a letter (incl. tildes, ü/ï, ñ) or a space as the
              // user types, rather than only flagging it after they try to submit.
              const lettersOnly = e.target.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
              setValue("client.full_name", lettersOnly, { shouldValidate: true });
            }}
          />
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
