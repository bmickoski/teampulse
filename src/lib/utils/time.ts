const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(date: string): string {
  const diff = (new Date(date).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return "just now";
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

export function isOverdue(dueDate: Date | null, status: string): boolean {
  if (!dueDate || status === "completed" || status === "archived") return false;
  return new Date(dueDate) < new Date();
}
