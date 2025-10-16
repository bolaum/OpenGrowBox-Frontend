import { DEFAULT_LOCALE } from "../config";

export function formatDateTime(dateString) {
  if (!dateString) return 'Not Available';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}