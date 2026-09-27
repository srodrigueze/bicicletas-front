"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { toast } from "sonner";

function firstDayOfMonth(): string {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), "yyyy-MM-dd");
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(firstDayOfMonth());
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!startDate || !endDate) return;
    if (startDate > endDate) {
      toast.error("La fecha de inicio no puede ser posterior a la fecha fin");
      return;
    }

    setDownloading(true);
    try {
      const url = `/api/reports/loans?start_date=${startDate}&end_date=${endDate}`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        throw new Error(body?.detail ?? "No se pudo generar el reporte");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `reporte_prestamos_${startDate}_${endDate}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo generar el reporte");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Reportes de préstamos</h1>
        <p className="text-sm text-muted-foreground">
          Genera un PDF con los préstamos del rango de fechas seleccionado. El rango cubre desde las 00:00 del
          primer día hasta las 23:59 del último.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Desde" htmlFor="start_date">
            <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="Hasta" htmlFor="end_date">
            <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>

        <Button onClick={handleDownload} disabled={downloading}>
          {downloading ? <FileText className="size-4 animate-pulse" /> : <Download className="size-4" />}
          Descargar PDF
        </Button>
      </div>
    </div>
  );
}
