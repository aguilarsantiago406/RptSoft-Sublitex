const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return DATE_FORMATTER.format(new Date(value));
}
