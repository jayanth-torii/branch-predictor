/**
 * Indian mobile numbers, normalised to ten bare digits.
 *
 * Stored without the country code, without spaces and without punctuation, so
 * two students who typed the same number differently are one contact rather
 * than two records. Formatting for display (the `+91` prefix, the tel: link)
 * is the reader's job, not the store's.
 */

/**
 * The country-code strip is LENGTH-GUARDED, and that is the whole point of
 * this function existing rather than being a one-line `replace`.
 *
 * `9123456789` is a perfectly ordinary mobile number that happens to begin
 * "91". A naive `replace(/^(\+?91)/, "")` eats its first two digits and then
 * rejects its own output as too short. A leading "91" is only a country code
 * when removing it leaves exactly ten digits; the same reasoning applies to a
 * leading "0", which is a trunk prefix only on an eleven-digit string.
 */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

/**
 * A ten-digit Indian mobile number. The leading 6-9 is what separates a
 * mobile from a landline or from `1234567890`, which is most of what gets
 * typed into a required phone field by someone who would rather not give one.
 */
export const MOBILE_RE = /^[6-9]\d{9}$/;

export function isMobile(value: string): boolean {
  return MOBILE_RE.test(value);
}

/** `9876543210` → `+91 98765 43210`. Display only. */
export function formatPhone(value: string): string {
  return isMobile(value) ? `+91 ${value.slice(0, 5)} ${value.slice(5)}` : value;
}
