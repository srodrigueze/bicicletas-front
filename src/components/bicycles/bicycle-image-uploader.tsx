"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadBicycleImage } from "@/hooks/use-bicycles";
import { ClientApiError } from "@/lib/api/client-fetch";
import type { Bicycle } from "@/lib/api/types";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function BicycleImageUploader({ bicycle }: { bicycle: Bicycle }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadImage = useUploadBicycleImage(bicycle.id);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_TYPES.has(file.type)) {
      toast.error("Solo se permiten imágenes JPEG, PNG o WEBP");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("La imagen debe pesar máximo 5MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    uploadImage.mutate(file, {
      onSuccess: () => toast.success("Foto de la bicicleta actualizada"),
      onError: (err) => {
        toast.error(err instanceof ClientApiError ? err.message : "No se pudo subir la imagen");
        setPreviewUrl(null);
      },
      onSettled: () => URL.revokeObjectURL(objectUrl),
    });
  }

  const displayUrl = previewUrl ?? bicycle.image_url ?? null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external GCS URL, no domain to preconfigure
          <img src={displayUrl} alt={`Bicicleta ${bicycle.code}`} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadImage.isPending}
          onClick={() => inputRef.current?.click()}
        >
          {uploadImage.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {bicycle.image_url ? "Cambiar foto" : "Subir foto"}
        </Button>
        <p className="text-xs text-muted-foreground">JPEG, PNG o WEBP, máximo 5MB</p>
      </div>
    </div>
  );
}
