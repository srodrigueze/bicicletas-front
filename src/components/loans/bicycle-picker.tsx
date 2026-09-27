"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ConditionBadge } from "@/components/bicycles/bicycle-badges";
import { useBicycles } from "@/hooks/use-bicycles";
import { BICYCLE_SIZE_LABELS } from "@/lib/format";

export function BicyclePicker({
  selected,
  onChange,
}: {
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [code, setCode] = useState("");
  const { data: bicycles, isLoading } = useBicycles({
    code: code || undefined,
    en_posesion_jac: true,
    limit: 100,
  });

  function toggle(id: number, checked: boolean) {
    onChange(checked ? [...selected, id] : selected.filter((x) => x !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por código"
          className="pl-8"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div className="max-h-64 overflow-y-auto rounded-md border border-border">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : !bicycles || bicycles.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No hay bicicletas disponibles.</p>
        ) : (
          <ul className="divide-y divide-border">
            {bicycles.map((bicycle) => {
              const disabled = !bicycle.is_available && !selected.includes(bicycle.id);
              return (
                <li key={bicycle.id}>
                  <label
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={selected.includes(bicycle.id)}
                      disabled={disabled}
                      onCheckedChange={(checked) => toggle(bicycle.id, Boolean(checked))}
                    />
                    <span className="font-mono font-medium">{bicycle.code}</span>
                    <span className="text-muted-foreground">{BICYCLE_SIZE_LABELS[bicycle.size]}</span>
                    <ConditionBadge condition={bicycle.condition} />
                    {!bicycle.is_available && (
                      <span className="ml-auto text-xs text-muted-foreground">Prestada</span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{selected.length} bicicleta(s) seleccionada(s)</p>
    </div>
  );
}
