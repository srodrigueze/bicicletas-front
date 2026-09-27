"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bicycleFormSchema, type BicycleFormInput } from "@/lib/validation/bicycle";
import { useCreateBicycle, useUpdateBicycle } from "@/hooks/use-bicycles";
import { BicycleImageUploader } from "@/components/bicycles/bicycle-image-uploader";
import { ClientApiError } from "@/lib/api/client-fetch";
import { BICYCLE_CONDITION_LABELS, BICYCLE_SIZE_LABELS } from "@/lib/format";
import type { Bicycle } from "@/lib/api/types";

const SIZES = ["small", "medium", "large"] as const;
const CONDITIONS = ["good", "bad"] as const;

export function BicycleFormDialog({ bicycle }: { bicycle?: Bicycle }) {
  const isEdit = Boolean(bicycle);
  const [open, setOpen] = useState(false);
  const createBicycle = useCreateBicycle();
  const updateBicycle = useUpdateBicycle(bicycle?.id ?? -1);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BicycleFormInput>({
    resolver: zodResolver(bicycleFormSchema),
    defaultValues: bicycle
      ? {
          code: bicycle.code,
          size: bicycle.size,
          condition: bicycle.condition,
          rueditas_asistencia: bicycle.rueditas_asistencia,
          tiene_pedales: bicycle.tiene_pedales,
          observations: bicycle.observations ?? "",
        }
      : {
          code: "",
          size: "medium",
          condition: "good",
          rueditas_asistencia: false,
          tiene_pedales: true,
          observations: "",
        },
  });

  async function onSubmit(data: BicycleFormInput) {
    try {
      if (isEdit && bicycle) {
        await updateBicycle.mutateAsync(data);
        toast.success(`Bicicleta ${data.code} actualizada`);
      } else {
        await createBicycle.mutateAsync(data);
        toast.success(`Bicicleta ${data.code} registrada`);
        reset();
      }
      setOpen(false);
    } catch (err) {
      const message = err instanceof ClientApiError ? err.message : "No se pudo guardar la bicicleta";
      toast.error(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={isEdit ? "outline" : "default"} size={isEdit ? "sm" : "default"} />
        }
      >
        {isEdit ? <Pencil className="size-4" /> : <Plus className="size-4" />}
        {isEdit ? "Editar" : "Nueva bicicleta"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar bicicleta ${bicycle?.code}` : "Registrar bicicleta"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "El id interno no cambia; puedes actualizar el código y las demás características."
              : "El código debe ser único y coincidir con la etiqueta física de la bicicleta."}
          </DialogDescription>
        </DialogHeader>

        {isEdit && bicycle ? <BicycleImageUploader bicycle={bicycle} /> : null}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Código" htmlFor="code" error={errors.code?.message}>
            <Input id="code" maxLength={5} placeholder="Ej: A012" {...register("code")} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tamaño" htmlFor="size" error={errors.size?.message}>
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="size" className="w-full">
                      <SelectValue>{(value: string) => BICYCLE_SIZE_LABELS[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {BICYCLE_SIZE_LABELS[size]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Estado" htmlFor="condition" error={errors.condition?.message}>
              <Controller
                name="condition"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="condition" className="w-full">
                      <SelectValue>{(value: string) => BICYCLE_CONDITION_LABELS[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {BICYCLE_CONDITION_LABELS[condition]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 rounded-md border border-border p-3">
            <Controller
              name="rueditas_asistencia"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                  Tiene rueditas de asistencia
                </label>
              )}
            />
            <Controller
              name="tiene_pedales"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                  Tiene pedales
                </label>
              )}
            />
          </div>

          <Field label="Observaciones" htmlFor="observations" error={errors.observations?.message}>
            <Textarea
              id="observations"
              rows={4}
              placeholder="Seguimiento de fallas u otros detalles relevantes"
              {...register("observations")}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {isEdit ? "Guardar cambios" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
