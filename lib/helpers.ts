import moment from "moment-timezone";

export const hourClock = (): string => {
  const time = new Date();
  return time.toLocaleString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDatelocal = (
  date: Date | string | number | null
): string | null => {
  if (!date || date === "") return null;
  const d = new Date(date);
  const formatted = d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Convierte una cadena base64 en un Blob (archivo binario)
export function base64ToBlob(base64Data: string, contentType = "image/png") {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}
//Esta funcion sirve para recibir horas en formato 24 ej: 18:00 y regresa en AM o PM
export function formatScheduleTime(value?: string) {
  const m = moment(String(value), "HH:mm", true);
  return m.isValid() ? m.format("hh:mm A") : "—";
};

//Esta funcion sirve para recibir fechas y horas en formato ISO, ej: 2026-07-20T17:50:52.120Z y regresa en AM o PM

export function formatCreatedAtOnlyHours(value?: string) {
  const m = moment.utc(value).tz("America/Mexico_City");
  return m.isValid() ? m.format("hh:mm A") : "—";
};

export function formatDateHours(value?: string) {
  const m = moment.utc(value).tz("America/Mexico_City");
  return m.isValid() ? m.format("DD-MM-YYYY hh:mm A") : "—";
};

export function formatCreatedAt(value?: string) {
  const m = moment.utc(value);
  return m.isValid() ? m.format("YYYY/MM/DD") : "—";
}

export function formatParse(value?: string) {
  if (!value) return "—";

  const m = moment.tz(value, "DD/MM/YYYY HH:mm", "America/Mexico_City");
  return m.isValid() ? m.format("YYYY/MM/DD") : "—";
}
export function formatParseHours(value?: string) {
  if (!value) return "—";

  const m = moment.tz(value, "HH:mm", "America/Mexico_City");
  return m.isValid() ? m.format("hh:mm A") : "—";
}
