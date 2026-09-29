"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { BicyclePicker } from "@/components/loans/bicycle-picker";
import { useAddBicyclesToLoan } from "@/hooks/use-loans";
import { ClientApiError } from "@/lib/api/client-fetch";

export function AddBicyclesDialog({ loanId }: { loanId: number }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const addBicycles = useAddBicyclesToLoan(loanId);

  async function handleConfirm() {
    if (selected.length === 0) return;
    try {
      await addBicycles.mutateAsync(selected);
      toast.success(`${selected.length} bicicleta(s) agregada(s) al préstamo`);
      setSelected([]);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudieron agregar las bicicletas");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSelected([]);
      }}
    >
      <DialogTrigger render={<Button variant="outline" />}>
        <Plus className="size-4" />
        Agregar bicicleta
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar bicicletas al préstamo</DialogTitle>
          <DialogDescription>
            Se suman al mismo préstamo sin afectar las bicicletas que ya están prestadas o entregadas.
          </DialogDescription>
        </DialogHeader>

        <BicyclePicker selected={selected} onChange={setSelected} />

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={selected.length === 0 || addBicycles.isPending} onClick={handleConfirm}>
            {addBicycles.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
