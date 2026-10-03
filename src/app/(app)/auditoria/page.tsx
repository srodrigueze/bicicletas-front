"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAudits } from "@/hooks/use-audits";
import { PageSizeSelect } from "@/components/app/page-size-select";
import { AUDIT_ACTION_LABELS, formatDateTime } from "@/lib/format";
import type { AuditLog } from "@/lib/api/types";

function prettyJson(value: string | null): string {
  if (!value) return "—";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function AuditDetailDialog({ log }: { log: AuditLog }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Ver detalle" />}>
        <Eye className="size-4" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {AUDIT_ACTION_LABELS[log.action]} · {log.entity_name} #{log.entity_id}
          </DialogTitle>
          <DialogDescription>
            {formatDateTime(log.timestamp)} · Usuario #{log.user_id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Valores anteriores</p>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">
              {prettyJson(log.previous_values)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Valores nuevos</p>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-xs whitespace-pre-wrap">
              {prettyJson(log.new_values)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AuditsPage() {
  const [skip, setSkip] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const { data: logs, isLoading } = useAudits(skip, pageSize);
  const hasNextPage = (logs?.length ?? 0) === pageSize;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Auditoría</h1>
        <p className="text-sm text-muted-foreground">
          Registro de solo lectura de los cambios realizados en el sistema.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !logs || logs.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No hay auditorías registradas.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Entidad</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell>#{log.user_id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{AUDIT_ACTION_LABELS[log.action] ?? log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.entity_name} #{log.entity_id}
                    </TableCell>
                    <TableCell>
                      <AuditDetailDialog log={log} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Mostrando {skip + 1}–{skip + logs.length}
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
