"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
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
import { userEditSchema, type UserEditFormInput } from "@/lib/validation/user";
import { useUpdateUser } from "@/hooks/use-users";
import { ClientApiError } from "@/lib/api/client-fetch";
import type { AppUser } from "@/lib/api/types";

export function EditUserDialog({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser(user.id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserEditFormInput>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { full_name: user.full_name, status: user.status },
  });

  async function onSubmit(data: UserEditFormInput) {
    try {
      await updateUser.mutateAsync(data);
      toast.success(`Usuario ${data.full_name} actualizado`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo actualizar el usuario");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Pencil className="size-4" />
        Editar
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>Documento: {user.document}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Nombre completo" htmlFor="edit_full_name" error={errors.full_name?.message}>
            <Input id="edit_full_name" {...register("full_name")} />
          </Field>

          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <label className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                <span>
                  <span className="block font-medium">Usuario activo</span>
                  <span className="block text-xs text-muted-foreground">
                    Un usuario inactivo no puede iniciar sesión
                  </span>
                </span>
                <Switch
                  checked={field.value === "activo"}
                  onCheckedChange={(checked) => field.onChange(checked ? "activo" : "inactivo")}
                />
              </label>
            )}
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
