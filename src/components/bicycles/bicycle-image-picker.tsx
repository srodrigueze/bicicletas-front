"use client";

import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ALLOWED_IMAGE_ACCEPT, validateImageFile } from "@/lib/image-validation";

/** For a bicycle that doesn't exist yet (create form): there's no id to upload
 * to, so this only picks and previews a file. The parent uploads it with
 * useUploadBicycleImage once the bicycle has been created. */
export function BicycleImagePicker({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
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

  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img src={previewUrl} alt="Foto de la bicicleta" className="size-full object-cover" />
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
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" />
            {file ? "Cambiar foto" : "Subir foto"}
          </Button>
          {file ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => onFileChange(null)}>
              <X className="size-4" />
              Quitar
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">Opcional. JPEG, PNG o WEBP, máximo 5MB</p>
      </div>
    </div>
  );
}
