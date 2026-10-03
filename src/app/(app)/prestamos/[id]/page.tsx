"use client";

import { use } from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, Bike, PackageCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/app/confirm-dialog";
import { useBicycles } from "@/hooks/use-bicycles";
import { useLoan, useMarkIncumplido, useReturnDetail } from "@/hooks/use-loans";
import { AddBicyclesDialog } from "@/components/loans/add-bicycles-dialog";
import { ConditionBadge } from "@/components/bicycles/bicycle-badges";
import { formatDateTime, getLoanStatus, LOAN_DETAIL_STATUS_LABELS, LOAN_STATUS_LABELS } from "@/lib/format";
import { ClientApiError } from "@/lib/api/client-fetch";
import type { Bicycle, LoanDetail } from "@/lib/api/types";

function BicycleDetailCard({
  detail,
  bicycle,
  onReturn,
  onMarkIncumplido,
  returning,
}: {
  detail: LoanDetail;
  bicycle: Bicycle | undefined;
  onReturn: () => void;
  onMarkIncumplido: () => Promise<unknown>;
  returning: boolean;
}) {
  const code = bicycle?.code ?? `#${detail.bicycle_id}`;
  const isOnLoan = detail.status === "on_loan";
  const isIncumplido = detail.status === "incumplido";
  const badgeVariant = isOnLoan ? "default" : isIncumplido ? "destructive" : "secondary";

  return (
    <div className="grid h-72 grid-rows-[minmax(0,7fr)_minmax(0,3fr)] overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative min-h-0 overflow-hidden bg-muted">
        {bicycle?.image_url ? (
          // absolute + inset-0: an intrinsically-sized <img> must never influence the
          // grid row's height, or it overrides the 70/30 split (that's what was
          // squeezing the info row below to nothing — see minmax(0, …) above too).
          // eslint-disable-next-line @next/next/no-img-element -- external GCS URL, no domain to preconfigure
          <img src={bicycle.image_url} alt={`Bicicleta ${code}`} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Bike className="size-10 text-muted-foreground" />
          </div>
        )}
        {bicycle ? (
          <div className="absolute top-2 right-2">
            <ConditionBadge condition={bicycle.condition} />
          </div>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-col justify-between gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-base font-semibold">{code}</span>
          <Badge variant={badgeVariant}>{LOAN_DETAIL_STATUS_LABELS[detail.status]}</Badge>
        </div>
        {isOnLoan ? (
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={returning} onClick={onReturn}>
              <PackageCheck className="size-4" />
              Entregar
            </Button>
            <ConfirmDialog
              triggerLabel="Incumplido"
              triggerIcon={<AlertTriangle className="size-4" />}
              triggerVariant="destructive"
              triggerSize="sm"
              title="¿Marcar esta bicicleta como incumplida?"
              description={`La bicicleta ${code} quedará registrada como no devuelta y saldrá de la posesión de la JAC. Si el cliente la devuelve después, puedes entregarla normalmente desde este mismo préstamo.`}
              confirmLabel="Marcar incumplido"
              destructive
              onConfirm={onMarkIncumplido}
            />
          </div>
        ) : isIncumplido ? (
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
  const markIncumplido = useMarkIncumplido(loanId);

  const bicycleById = new Map((bicycles ?? []).map((b) => [b.id, b]));

  async function handleReturn(detailId: number, code: string) {
    try {
      await returnDetail.mutateAsync(detailId);
      toast.success(`Bicicleta ${code} marcada como entregada`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo registrar la devolución");
    }
  }

  async function handleMarkIncumplido(detailId: number, code: string) {
    try {
      await markIncumplido.mutateAsync(detailId);
      toast.success(`Bicicleta ${code} marcada como incumplida`);
    } catch (err) {
      toast.error(err instanceof ClientApiError ? err.message : "No se pudo marcar como incumplida");
      throw err;
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

  const loanStatus = getLoanStatus(loan);
  const loanBadgeVariant = loanStatus === "activo" ? "default" : loanStatus === "incumplido" ? "destructive" : "secondary";

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
        <Badge variant={loanBadgeVariant} className="w-fit">
          Préstamo {LOAN_STATUS_LABELS[loanStatus].toLowerCase()}
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
              onMarkIncumplido={() =>
                handleMarkIncumplido(detail.id, bicycleById.get(detail.bicycle_id)?.code ?? `#${detail.bicycle_id}`)
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
