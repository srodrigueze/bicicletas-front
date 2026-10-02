/** Mirrors the backend's own check in POST /bicycles/{id}/image (and /{id} for
 * create+image) — kept here once so both the create and edit image pickers
 * validate the same way and fail fast client-side before hitting the network. */
export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Solo se permiten imágenes JPEG, PNG o WEBP";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen debe pesar máximo 5MB";
  }
  return null;
}
