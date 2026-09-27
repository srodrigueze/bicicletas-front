"use client";

import { use } from "react";
import { toast } from "sonner";
import { ArrowLeft, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBicycles } from "@/hooks/use-bicycles";
import { useLoan, useReturnDetail } from "@/hooks/use-loans";
import { SwapBicycleDialog } from "@/components/loans/swap-bicycle-dialog";
import { formatDateTime } from "@/lib/format";
import { ClientApiError } from "@/lib/api/client-fetch";

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const loanId = Number(id);
  const { data: loan, isLoading } = useLoan(loanId);
  const { data: bicycles } = useBicycles({ limit: 200 });
  const returnDetail = useReturnDetail(loanId);

  const bicycleByCode = new Map((bicycles ?? []).map((b) => [b.id, b]));

  async function handleReturn(detailId: number, code: string) {
    try {
      await returnDetail.mutateAsync(detailId);
      toast.success(`Bicicleta ${code} marcada como entregada`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo registrar la devolución");
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!loan) {
    return <p className="text-sm text-muted-foreground">No se encontró el préstamo.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/prestamos" className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver a préstamos
      </Link>

      <div className="flex flex-col justify-between gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-lg font-semibold">{loan.client.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            Documento {loan.client.document} · Celular {loan.client.phone}
          </p>
          <p className="text-sm text-muted-foreground">Prestado el {formatDateTime(loan.loan_datetime)}</p>
        </div>
        <Badge variant={loan.is_active ? "default" : "secondary"} className="w-fit">
          {loan.is_active ? "Préstamo activo" : "Préstamo cerrado"}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Bicicletas del préstamo</h2>
        {loan.details.map((detail) => {
          const bicycle = bicycleByCode.get(detail.bicycle_id);
          const code = bicycle?.code ?? `#${detail.bicycle_id}`;
          return (
            <div
              key={detail.id}
              className="flex flex-col justify-between gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium">{code}</span>
                <Badge variant={detail.status === "on_loan" ? "default" : "secondary"}>
                  {detail.status === "on_loan" ? "Prestada" : "Entregada"}
                </Badge>
                {detail.returned_at ? (
                  <span className="text-xs text-muted-foreground">
                    Entregada el {formatDateTime(detail.returned_at)}
                  </span>
                ) : null}
              </div>
              {detail.status === "on_loan" ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={returnDetail.isPending}
                    onClick={() => handleReturn(detail.id, code)}
                  >
                    <PackageCheck className="size-4" />
                    Devolver
                  </Button>
                  <SwapBicycleDialog loanId={loanId} detailId={detail.id} currentCode={code} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
