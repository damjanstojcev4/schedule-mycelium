const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats an ISO date/datetime string as "DD MMM YYYY"
 * e.g. "2026-06-05T10:30:00" → "05 Jun 2026"
 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Formats an ISO datetime string as "HH:mm"
 * e.g. "2026-06-05T10:30:00" → "10:30"
 */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats a date + time together
 * e.g. "05 Jun 2026 · 10:30"
 */
export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

/**
 * Formats a price as MKD currency string
 * e.g. 500 → "500 MKD"
 */
export function formatPrice(price: number): string {
  return `${price} MKD`;
}

/**
 * Returns today's date as YYYY-MM-DD string
 */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
