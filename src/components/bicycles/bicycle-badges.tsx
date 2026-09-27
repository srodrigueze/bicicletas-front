import { Badge } from "@/components/ui/badge";
import { BICYCLE_CONDITION_LABELS, BICYCLE_SIZE_LABELS } from "@/lib/format";
import type { Bicycle } from "@/lib/api/types";

export function ConditionBadge({ condition }: { condition: Bicycle["condition"] }) {
  if (condition === "good") {
    return (
      <Badge className="border-transparent bg-available text-available-foreground">
        {BICYCLE_CONDITION_LABELS.good}
      </Badge>
    );
  }
  return (
    <Badge className="border-transparent bg-repair text-repair-foreground">
      {BICYCLE_CONDITION_LABELS.bad}
    </Badge>
  );
}

export function AvailabilityBadge({ bicycle }: { bicycle: Bicycle }) {
  if (!bicycle.en_posesion_jac) {
    return <Badge variant="destructive">Fuera de inventario</Badge>;
  }
  if (bicycle.is_available) {
    return (
      <Badge className="border-transparent bg-available text-available-foreground">Disponible</Badge>
    );
  }
  return <Badge variant="secondary">Prestada</Badge>;
}

export function SizeLabel({ size }: { size: Bicycle["size"] }) {
  return <span>{BICYCLE_SIZE_LABELS[size]}</span>;
}
