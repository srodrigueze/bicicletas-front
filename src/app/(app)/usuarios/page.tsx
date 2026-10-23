"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useResetPassword, useUsers } from "@/hooks/use-users";
import { useSession } from "@/lib/session-context";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { PageSizeSelect } from "@/components/app/page-size-select";
import { USER_ROLE_LABELS } from "@/lib/format";
import { ClientApiError } from "@/lib/api/client-fetch";

export default function UsersPage() {
  const session = useSession();
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data: users, isLoading } = useUsers(skip, pageSize);
  const resetPassword = useResetPassword();
  const hasNextPage = (users?.length ?? 0) === pageSize;

  async function handleReset(id: number, name: string) {
    try {
      await resetPassword.mutateAsync(id);
      toast.success(`Contraseña de ${name} restablecida a los últimos 4 dígitos de su documento. Deberá cambiarla al ingresar`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo restablecer la contraseña");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Usuarios del sistema</h1>
          <p className="text-sm text-muted-foreground">Solo el administrador gestiona el acceso.</p>
        </div>
        <CreateUserDialog />
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No hay usuarios registrados.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const isSelf = user.id === session.userId;
                  const isOtherAdmin = user.role === "administrador" && !isSelf;
                  const locked = isSelf || (isOtherAdmin && !session.isSuperadmin);
                  const lockReason = isSelf
                    ? "No puedes modificar tu propia cuenta desde aquí"
                    : "Solo el superadministrador puede gestionar a otro administrador";

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell className="font-mono">{user.document}</TableCell>
                      <TableCell>{USER_ROLE_LABELS[user.role]}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "activo" ? "default" : "secondary"}>
                          {user.status === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        {locked ? (
                          <Tooltip>
                            <TooltipTrigger render={<span />}>
                              <Button variant="outline" size="sm" disabled>
                                Editar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{lockReason}</TooltipContent>
                          </Tooltip>
                        ) : (
                          <>
                            <EditUserDialog user={user} />
                            <ConfirmDialog
                              triggerLabel="Restablecer"
                              triggerIcon={<KeyRound className="size-4" />}
                              triggerVariant="outline"
                              title={`Restablecer contraseña de ${user.full_name}`}
                              description="La contraseña volverá a ser los últimos 4 dígitos de su documento, se cerrarán sus sesiones abiertas y deberá cambiarla al ingresar."
                              confirmLabel="Restablecer"
                              onConfirm={() => handleReset(user.id, user.full_name)}
                            />
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1}–{skip + users.length}
            </p>
            <div className="flex items-center gap-2">
              <PageSizeSelect
                value={pageSize}
                onChange={(size) => {
                  setSkip(0);
                  setPageSize(size);
                }}
              />
              <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - pageSize))}>
                Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setSkip(skip + pageSize)}>
                Siguiente
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
