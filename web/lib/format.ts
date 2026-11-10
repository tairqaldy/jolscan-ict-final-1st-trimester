/**
 * Formatting helpers. Dates are formatted by hand in Astana time (UTC+5,
 * no DST) instead of Intl time zones, so the server and every browser print
 * exactly the same string and hydration never mismatches.
 */
const ASTANA_OFFSET_MS = 5 * 60 * 60 * 1000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function astana(iso: string) {
  return new Date(Date.parse(iso) + ASTANA_OFFSET_MS);
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "8 Nov 2026" */
export function formatDate(iso: string): string {
  const d = astana(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "8 Nov, 14:05" */
export function formatDateTime(iso: string): string {
  const d = astana(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/** "2026-11-08" in Astana time, for grouping by day and date inputs. */
export function dayKey(iso: string): string {
  const d = astana(iso);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** "8 Nov" from a dayKey. */
export function formatDayKey(key: string): string {
  const [, m, d] = key.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export function formatSla(hours: number | null): string {
  if (hours === null) return "No target";
  if (hours >= 48 && hours % 24 === 0) return `${hours / 24} days (${hours} h)`;
  return `${hours} h`;
}

export const formatPct = (v: number, digits = 0) => `${(v * 100).toFixed(digits)}%`;
export const formatScore = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0$/, ""));

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)];
}
