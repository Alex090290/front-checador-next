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
