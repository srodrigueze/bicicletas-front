import { Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BICYCLE_CONDITION_LABELS, BICYCLE_SIZE_LABELS } from "@/lib/format";
import type { Bicycle } from "@/lib/api/types";

export function BicycleThumbnail({ bicycle, className }: { bicycle: Bicycle; className?: string }) {
  return (
    <div
      className={`flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted ${className ?? ""}`}
    >
      {bicycle.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- external GCS URL, no domain to preconfigure
        <img src={bicycle.image_url} alt={`Bicicleta ${bicycle.code}`} className="size-full object-cover" />
      ) : (
        <Bike className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}

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
