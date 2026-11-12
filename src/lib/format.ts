const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Berlin",
});

export function formatDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}
