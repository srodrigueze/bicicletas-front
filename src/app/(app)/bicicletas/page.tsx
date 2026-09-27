"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArchiveRestore, Loader2, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBicycles, useDeleteBicycle, useRestoreBicycle } from "@/hooks/use-bicycles";
import { BicycleFormDialog } from "@/components/bicycles/bicycle-form-dialog";
import { AvailabilityBadge, BicycleThumbnail, ConditionBadge } from "@/components/bicycles/bicycle-badges";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { BICYCLE_SIZE_LABELS } from "@/lib/format";
import { ClientApiError } from "@/lib/api/client-fetch";
import type { BicycleListFilters } from "@/lib/api/types";

const PAGE_SIZE = 20;

export default function BicyclesPage() {
  const [code, setCode] = useState("");
  const [size, setSize] = useState<string>("all");
  const [showRetired, setShowRetired] = useState(false);
  const [skip, setSkip] = useState(0);

  const filters: BicycleListFilters = {
    skip,
    limit: PAGE_SIZE,
    code: code || undefined,
    size: size === "all" ? undefined : (size as BicycleListFilters["size"]),
    en_posesion_jac: showRetired ? undefined : true,
  };

  const { data: bicycles, isLoading, isPlaceholderData } = useBicycles(filters);
  const deleteBicycle = useDeleteBicycle();
  const restoreBicycle = useRestoreBicycle();

  async function handleDelete(id: number, codeLabel: string) {
    try {
      await deleteBicycle.mutateAsync(id);
      toast.success(`Bicicleta ${codeLabel} marcada como fuera de inventario`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo retirar la bicicleta");
    }
  }

  async function handleRestore(id: number, codeLabel: string) {
    try {
      await restoreBicycle.mutateAsync(id);
      toast.success(`Bicicleta ${codeLabel} restaurada al inventario`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo restaurar la bicicleta");
    }
  }

  const hasNextPage = (bicycles?.length ?? 0) === PAGE_SIZE;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Inventario de bicicletas</h1>
          <p className="text-sm text-muted-foreground">Consulta, registra y actualiza el estado de las bicicletas.</p>
        </div>
        <BicycleFormDialog />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-52">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por código"
            className="pl-8"
            value={code}
            onChange={(e) => {
              setSkip(0);
              setCode(e.target.value);
            }}
          />
        </div>
        <Select
          value={size}
          onValueChange={(v) => {
            setSkip(0);
            setSize(v as string);
          }}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Tamaño">
              {(value: string) => (value === "all" ? "Todos los tamaños" : BICYCLE_SIZE_LABELS[value])}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tamaños</SelectItem>
            {Object.entries(BICYCLE_SIZE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground sm:ml-auto">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={showRetired}
            onChange={(e) => {
              setSkip(0);
              setShowRetired(e.target.checked);
            }}
          />
          Incluir fuera de inventario
        </label>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !bicycles || bicycles.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No hay bicicletas que coincidan con la búsqueda.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14" />
                  <TableHead>Código</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Rueditas</TableHead>
                  <TableHead>Pedales</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Disponibilidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bicycles.map((bicycle) => (
                  <TableRow key={bicycle.id}>
                    <TableCell>
                      <BicycleThumbnail bicycle={bicycle} />
                    </TableCell>
                    <TableCell className="font-mono font-medium">{bicycle.code}</TableCell>
                    <TableCell>{BICYCLE_SIZE_LABELS[bicycle.size]}</TableCell>
                    <TableCell>{bicycle.rueditas_asistencia ? "Sí" : "No"}</TableCell>
                    <TableCell>{bicycle.tiene_pedales ? "Sí" : "No"}</TableCell>
                    <TableCell>
                      <ConditionBadge condition={bicycle.condition} />
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge bicycle={bicycle} />
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <BicycleFormDialog bicycle={bicycle} />
                      {bicycle.en_posesion_jac ? (
                        <ConfirmDialog
                          triggerLabel="Retirar"
                          triggerIcon={<Trash2 className="size-4" />}
                          triggerVariant="outline"
                          destructive
                          title={`Retirar bicicleta ${bicycle.code}`}
                          description="Se marcará como fuera de inventario. No se elimina el registro y puedes restaurarla luego."
                          confirmLabel="Retirar"
                          onConfirm={() => handleDelete(bicycle.id, bicycle.code)}
                        />
                      ) : (
                        <ConfirmDialog
                          triggerLabel="Restaurar"
                          triggerIcon={<ArchiveRestore className="size-4" />}
                          triggerVariant="outline"
                          title={`Restaurar bicicleta ${bicycle.code}`}
                          description="Volverá a estar disponible para préstamo si no tiene un préstamo pendiente."
                          confirmLabel="Restaurar"
                          onConfirm={() => handleRestore(bicycle.id, bicycle.code)}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {bicycles.map((bicycle) => (
              <div key={bicycle.id} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <BicycleThumbnail bicycle={bicycle} />
                    <div>
                      <p className="font-mono text-base font-semibold">{bicycle.code}</p>
                      <p className="text-sm text-muted-foreground">{BICYCLE_SIZE_LABELS[bicycle.size]}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <ConditionBadge condition={bicycle.condition} />
                    <AvailabilityBadge bicycle={bicycle} />
                  </div>
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <dt>Rueditas:</dt>
                    <dd>{bicycle.rueditas_asistencia ? "Sí" : "No"}</dd>
                  </div>
                  <div className="flex gap-1">
                    <dt>Pedales:</dt>
                    <dd>{bicycle.tiene_pedales ? "Sí" : "No"}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex gap-2">
                  <BicycleFormDialog bicycle={bicycle} />
                  {bicycle.en_posesion_jac ? (
                    <ConfirmDialog
                      triggerLabel="Retirar"
                      triggerIcon={<Trash2 className="size-4" />}
                      triggerVariant="outline"
                      destructive
                      title={`Retirar bicicleta ${bicycle.code}`}
                      description="Se marcará como fuera de inventario. No se elimina el registro y puedes restaurarla luego."
                      confirmLabel="Retirar"
                      onConfirm={() => handleDelete(bicycle.id, bicycle.code)}
                    />
                  ) : (
                    <ConfirmDialog
                      triggerLabel="Restaurar"
                      triggerIcon={<ArchiveRestore className="size-4" />}
                      triggerVariant="outline"
                      title={`Restaurar bicicleta ${bicycle.code}`}
                      description="Volverá a estar disponible para préstamo si no tiene un préstamo pendiente."
                      confirmLabel="Restaurar"
                      onConfirm={() => handleRestore(bicycle.id, bicycle.code)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1}–{skip + bicycles.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}>
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage || isPlaceholderData}
                onClick={() => setSkip(skip + PAGE_SIZE)}
              >
                {isPlaceholderData ? <Loader2 className="size-4 animate-spin" /> : "Siguiente"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
