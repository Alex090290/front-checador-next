/**
 * True si hay algo que enviar al endpoint de imagen (no null/vacío / string en blanco).
 * Vive fuera de `"use server"` porque Next solo permite exportar async actions en esos archivos.
 */
export function isNonEmptyImagePayload(
  value: unknown
): value is string | File | Blob {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  return false;
}
