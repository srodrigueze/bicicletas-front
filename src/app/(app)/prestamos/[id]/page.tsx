"use client";

import { use } from "react";
import { toast } from "sonner";
import { ArrowLeft, Bike, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBicycles } from "@/hooks/use-bicycles";
import { useLoan, useReturnDetail } from "@/hooks/use-loans";
import { AddBicyclesDialog } from "@/components/loans/add-bicycles-dialog";
import { ConditionBadge } from "@/components/bicycles/bicycle-badges";
import { formatDateTime } from "@/lib/format";
import { ClientApiError } from "@/lib/api/client-fetch";
import type { Bicycle, LoanDetail } from "@/lib/api/types";

function BicycleDetailCard({
  detail,
  bicycle,
  onReturn,
  returning,
}: {
  detail: LoanDetail;
  bicycle: Bicycle | undefined;
  onReturn: () => void;
  returning: boolean;
}) {
  const code = bicycle?.code ?? `#${detail.bicycle_id}`;
  const isOnLoan = detail.status === "on_loan";

  return (
    <div className="grid h-72 grid-rows-[7fr_3fr] overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative flex items-center justify-center bg-muted">
        {bicycle?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- external GCS URL, no domain to preconfigure
          <img src={bicycle.image_url} alt={`Bicicleta ${code}`} className="size-full object-cover" />
        ) : (
          <Bike className="size-10 text-muted-foreground" />
        )}
        {bicycle ? (
          <div className="absolute top-2 right-2">
            <ConditionBadge condition={bicycle.condition} />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col justify-between gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-base font-semibold">{code}</span>
          <Badge variant={isOnLoan ? "default" : "secondary"}>{isOnLoan ? "Prestada" : "Entregada"}</Badge>
        </div>
        {isOnLoan ? (
          <Button size="sm" disabled={returning} onClick={onReturn}>
            <PackageCheck className="size-4" />
            Entregar
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {detail.returned_at ? `Entregada el ${formatDateTime(detail.returned_at)}` : null}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const loanId = Number(id);
  const { data: loan, isLoading } = useLoan(loanId);
  const { data: bicycles } = useBicycles({ limit: 200 });
  const returnDetail = useReturnDetail(loanId);

  const bicycleById = new Map((bicycles ?? []).map((b) => [b.id, b]));

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
        <Skeleton className="h-72 w-full" />
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Bicicletas del préstamo</h2>
          <AddBicyclesDialog loanId={loanId} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loan.details.map((detail) => (
            <BicycleDetailCard
              key={detail.id}
              detail={detail}
              bicycle={bicycleById.get(detail.bicycle_id)}
              returning={returnDetail.isPending}
              onReturn={() => handleReturn(detail.id, bicycleById.get(detail.bicycle_id)?.code ?? `#${detail.bicycle_id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
