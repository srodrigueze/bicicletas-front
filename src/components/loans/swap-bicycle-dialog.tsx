"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useBicycles } from "@/hooks/use-bicycles";
import { useSwapBicycle } from "@/hooks/use-loans";
import { ClientApiError } from "@/lib/api/client-fetch";
import { BICYCLE_SIZE_LABELS } from "@/lib/format";

export function SwapBicycleDialog({
  loanId,
  detailId,
  currentCode,
}: {
  loanId: number;
  detailId: number;
  currentCode: string;
}) {
  const [open, setOpen] = useState(false);
  const [newBicycleId, setNewBicycleId] = useState<string | null>(null);
  const { data: bicycles } = useBicycles({ en_posesion_jac: true, limit: 100 });
  const swapBicycle = useSwapBicycle(loanId);

  const available = (bicycles ?? []).filter((b) => b.is_available);

  async function handleConfirm() {
    if (!newBicycleId) return;
    try {
      await swapBicycle.mutateAsync({ detail_id: detailId, new_bicycle_id: Number(newBicycleId) });
      toast.success("Bicicleta cambiada");
      setOpen(false);
      setNewBicycleId("");
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo cambiar la bicicleta");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Repeat className="size-4" />
        Cambiar
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar bicicleta {currentCode}</DialogTitle>
          <DialogDescription>
            La bicicleta actual quedará entregada y disponible; la nueva quedará prestada en este mismo préstamo.
          </DialogDescription>
        </DialogHeader>

        <Select value={newBicycleId} onValueChange={setNewBicycleId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona la nueva bicicleta">
              {(value: string | null) => {
                const bicycle = available.find((b) => String(b.id) === value);
                return bicycle ? `${bicycle.code} · ${BICYCLE_SIZE_LABELS[bicycle.size]}` : "Selecciona la nueva bicicleta";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {available.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No hay bicicletas disponibles</p>
            ) : (
              available.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.code} · {BICYCLE_SIZE_LABELS[b.size]}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={!newBicycleId || swapBicycle.isPending} onClick={handleConfirm}>
            {swapBicycle.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
