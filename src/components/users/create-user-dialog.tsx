"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { userCreateSchema, type UserCreateFormInput } from "@/lib/validation/user";
import { useCreateUser } from "@/hooks/use-users";
import { ClientApiError } from "@/lib/api/client-fetch";
import { USER_ROLE_LABELS } from "@/lib/format";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateFormInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: { full_name: "", document: "", role: "operador" },
  });

  async function onSubmit(data: UserCreateFormInput) {
    try {
      await createUser.mutateAsync(data);
      toast.success(`Usuario ${data.full_name} creado. Contraseña inicial: últimos 4 dígitos del documento. Deberá cambiarla al ingresar`);
      reset();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo crear el usuario");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Nuevo usuario
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Crear usuario</DialogTitle>
          <DialogDescription>
            La contraseña inicial son los últimos 4 dígitos del documento. El usuario deberá cambiarla
            en su primer ingreso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Nombre completo" htmlFor="full_name" error={errors.full_name?.message}>
            <Input id="full_name" {...register("full_name")} />
          </Field>

          <Field label="Número de documento" htmlFor="document" error={errors.document?.message}>
            <Input id="document" inputMode="numeric" {...register("document")} />
          </Field>

          <Field label="Rol" htmlFor="role" error={errors.role?.message}>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue>{(value: string) => USER_ROLE_LABELS[value]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operador">{USER_ROLE_LABELS.operador}</SelectItem>
                    <SelectItem value="administrador">{USER_ROLE_LABELS.administrador}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
