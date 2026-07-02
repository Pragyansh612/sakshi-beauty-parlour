// Supabase Auth requires an email identifier; the site only collects a phone
// number, so we derive a stable, non-deliverable synthetic email from it.
// See BLOCKERS.md (BLOCKER-001) for why phone+password isn't natively supported.

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
}

export function phoneToSyntheticEmail(phone: string): string {
  return `p${normalizePhone(phone)}@phone.sakshibeautyparlour.internal`;
}
