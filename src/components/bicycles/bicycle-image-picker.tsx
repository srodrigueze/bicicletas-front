"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOWED_IMAGE_ACCEPT, validateImageFile } from "@/lib/image-validation";

/** Picks and previews a photo without uploading it — the parent only sends it
 * (via useUploadBicycleImage) when the form is actually saved. Used for both
 * creating a bicycle (no id to upload to yet) and editing one: picking a new
 * photo must not take effect until "Guardar cambios", or closing the dialog
 * without saving would leave the bicycle's photo changed anyway. */
export function BicycleImagePicker({
  file,
  onFileChange,
  currentImageUrl,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** The bicycle's already-saved photo (edit mode only), shown until a new file is picked. */
  currentImageUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;

    const error = validateImageFile(selected);
    if (error) {
      toast.error(error);
      return;
    }
    onFileChange(selected);
  }

  const displayUrl = previewUrl ?? currentImageUrl ?? null;
  const hasAnyImage = Boolean(file ?? currentImageUrl);

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview or external GCS URL, no domain to preconfigure
          <img src={displayUrl} alt="Foto de la bicicleta" className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-start gap-1">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" />
            {hasAnyImage ? "Cambiar foto" : "Subir foto"}
          </Button>
          {file ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
              <X className="size-4" />
              Quitar
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {file ? "Se guardará al confirmar el formulario." : "Opcional. JPEG, PNG o WEBP, máximo 5MB"}
        </p>
      </div>
    </div>
  );
}
