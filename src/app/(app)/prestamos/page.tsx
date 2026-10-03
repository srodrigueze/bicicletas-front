"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoans } from "@/hooks/use-loans";
import { formatDateTime } from "@/lib/format";

const PAGE_SIZE = 20;

export default function LoansPage() {
  const router = useRouter();
  const [activeOnly, setActiveOnly] = useState(true);
  const [skip, setSkip] = useState(0);

  const { data: loans, isLoading, isPlaceholderData } = useLoans({
    active_only: activeOnly,
    skip,
    limit: PAGE_SIZE,
  });
  const hasNextPage = (loans?.length ?? 0) === PAGE_SIZE;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold">Préstamos</h1>
          <p className="text-sm text-muted-foreground">
            {activeOnly ? "Bicicletas afuera en este momento." : "Historial completo de préstamos."}
          </p>
        </div>
        <Button render={<Link href="/prestamos/nuevo" />} nativeButton={false}>
          <Plus className="size-4" />
          Nuevo préstamo
        </Button>
      </div>

      <Tabs
        value={activeOnly ? "active" : "all"}
        onValueChange={(v) => {
          setSkip(0);
          setActiveOnly(v === "active");
        }}
      >
        <TabsList>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !loans || loans.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {activeOnly ? "No hay préstamos activos en este momento." : "No hay préstamos registrados."}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-md border border-border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Bicicletas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => (
                  <TableRow
                    key={loan.id}
                    tabIndex={0}
                    className="cursor-pointer"
                    onClick={() => router.push(`/prestamos/${loan.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/prestamos/${loan.id}`);
                    }}
                  >
                    <TableCell className="font-medium">{loan.client.full_name}</TableCell>
                    <TableCell className="font-mono">{loan.client.document}</TableCell>
                    <TableCell>{formatDateTime(loan.loan_datetime)}</TableCell>
                    <TableCell>{loan.details.length}</TableCell>
                    <TableCell>
                      <Badge variant={loan.is_active ? "default" : "secondary"}>
                        {loan.is_active ? "Activo" : "Cerrado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 md:hidden">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                href={`/prestamos/${loan.id}`}
                className="flex items-center justify-between rounded-md border border-border bg-card p-3"
              >
                <div>
                  <p className="font-medium">{loan.client.full_name}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(loan.loan_datetime)}</p>
                  <p className="text-sm text-muted-foreground">{loan.details.length} bicicleta(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={loan.is_active ? "default" : "secondary"}>
                    {loan.is_active ? "Activo" : "Cerrado"}
                  </Badge>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1}–{skip + loans.length}
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
