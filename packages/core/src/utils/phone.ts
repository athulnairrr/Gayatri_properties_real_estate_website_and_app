// Lightweight phone helpers shared by both apps. Deliberately simple for the MVP
// (India-first: +91), not a full libphonenumber integration.

export function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9+]/g, "");
}

/** Loose validation good enough for an MVP enquiry form: digits only after normalizing,
 * 10-15 characters including an optional leading '+'. Real carrier validation happens
 * nowhere in this MVP — the phone is intentionally unverified (see docs/ARCHITECTURE.md). */
export function isPlausiblePhone(raw: string): boolean {
  const normalized = normalizePhone(raw);
  const digits = normalized.replace(/^\+/, "");
  return /^[0-9]{8,15}$/.test(digits);
}

/** Assumes an Indian number if no country code was given — matches the seed data and
 * the spec's +91 examples. Callers with international users should extend this. */
export function toE164IndiaDefault(raw: string): string {
  const normalized = normalizePhone(raw);
  if (normalized.startsWith("+")) return normalized;
  const digits = normalized.replace(/^0+/, "");
  if (digits.length === 10) return `+91${digits}`;
  return normalized.startsWith("91") ? `+${digits}` : `+${digits}`;
}

export function telHref(phone: string): string {
  return `tel:${normalizePhone(phone)}`;
}

export function whatsappHref(phone: string, message?: string): string {
  const digits = normalizePhone(phone).replace(/^\+/, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
