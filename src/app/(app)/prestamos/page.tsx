"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Loader2, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLoans } from "@/hooks/use-loans";
import { PageSizeSelect } from "@/components/app/page-size-select";
import { formatDateTime, getLoanStatus, LOAN_STATUS_LABELS } from "@/lib/format";
import type { Loan, LoanListFilters, LoanStatus } from "@/lib/api/types";

function LoanStatusBadge({ loan }: { loan: Pick<Loan, "is_active" | "details"> }) {
  const status = getLoanStatus(loan);
  const variant = status === "activo" ? "default" : status === "incumplido" ? "destructive" : "secondary";
  return <Badge variant={variant}>{LOAN_STATUS_LABELS[status]}</Badge>;
}

export default function LoansPage() {
  const router = useRouter();
  const [activeOnly, setActiveOnly] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const dateRangeInvalid = Boolean(startDate && endDate && startDate > endDate);
  const activeFilterCount = (status !== "all" ? 1 : 0) + (startDate || endDate ? 1 : 0);

  function clearFilters() {
    setSkip(0);
    setStatus("all");
    setStartDate("");
    setEndDate("");
  }

  const filters: LoanListFilters = {
    skip,
    limit: pageSize,
    active_only: activeOnly,
    ...(!activeOnly && status !== "all" ? { status: status as LoanStatus } : {}),
    ...(!activeOnly && !dateRangeInvalid && startDate ? { start_date: startDate } : {}),
    ...(!activeOnly && !dateRangeInvalid && endDate ? { end_date: endDate } : {}),
  };

  const { data: loans, isLoading, isPlaceholderData } = useLoans(filters);
  const hasNextPage = (loans?.length ?? 0) === pageSize;

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

      {!activeOnly ? (
        <Collapsible className="flex flex-col gap-2">
          <div className="flex justify-end">
            <CollapsibleTrigger render={<Button variant="outline" />}>
              <SlidersHorizontal className="size-4" />
              Filtros
              {activeFilterCount > 0 ? (
                <Badge variant="secondary" className="px-1.5">
                  {activeFilterCount}
                </Badge>
              ) : null}
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="flex flex-col gap-3 rounded-md border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Filtros</p>
              {activeFilterCount > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Limpiar
                </Button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-start gap-3">
              <Select
                value={status}
                onValueChange={(v) => {
                  setSkip(0);
                  setStatus(v as string);
                }}
              >
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue placeholder="Estado">
                    {(value: string) => (value === "all" ? "Todos los estados" : LOAN_STATUS_LABELS[value as LoanStatus])}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(LOAN_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Field label="Desde" htmlFor="loan_start_date">
                    <Input
                      id="loan_start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setSkip(0);
                        setStartDate(e.target.value);
                      }}
                    />
                  </Field>
                  <Field label="Hasta" htmlFor="loan_end_date">
                    <Input
                      id="loan_end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setSkip(0);
                        setEndDate(e.target.value);
                      }}
                    />
                  </Field>
                </div>
                {dateRangeInvalid ? (
                  <p className="text-xs text-destructive">La fecha de inicio no puede ser posterior a la fecha fin</p>
                ) : null}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

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
                      <LoanStatusBadge loan={loan} />
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
                  <LoanStatusBadge loan={loan} />
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1}–{skip + loans.length}
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
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage || isPlaceholderData}
                onClick={() => setSkip(skip + pageSize)}
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
