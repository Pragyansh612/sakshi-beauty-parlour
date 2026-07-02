// Phone + password in the UI; Supabase Auth uses a stable synthetic email
// derived from the phone number (email provider — no SMS, no real inbox).
// Set NEXT_PUBLIC_AUTH_EMAIL_DOMAIN to a domain with DNS, or it falls back to
// your Supabase project hostname (e.g. xyz.supabase.co).

export const PHONE_REGEX = /^[6-9]\d{9}$/;

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
}

export function getAuthEmailDomain(): string {
  const fromEnv = process.env.NEXT_PUBLIC_AUTH_EMAIL_DOMAIN?.trim();
  if (fromEnv) return fromEnv;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname;
      if (host !== 'localhost' && !host.startsWith('127.')) return host;
    } catch {
      // fall through
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      return new URL(supabaseUrl).hostname;
    } catch {
      // fall through
    }
  }

  return 'sakshibeautyparlour.in';
}

export function phoneToAuthEmail(phone: string): string {
  return `p${normalizePhone(phone)}@${getAuthEmailDomain()}`;
}
