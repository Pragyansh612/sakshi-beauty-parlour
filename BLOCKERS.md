# Blockers

---

## BLOCKER-001 — Supabase Auth: Phone + Password is not natively supported

**Status**: Resolved — see recommended solution below. Proceeding with implementation.

### What the blocker is

Supabase Auth has two separate providers for password-based and phone-based authentication:

1. **Email provider**: `signUpWithPassword({ email, password })` → full email + password with reset links. Fully production-ready.
2. **Phone provider**: `signInWithOtp({ phone })` → OTP via SMS only. Password is **not** supported with the phone provider.

There is no native Supabase Auth flow for "phone number + password" without OTP. The planning documents assumed this combination was possible, but it isn't — Supabase does not support it cleanly.

### Why this matters

The original spec required:
- Phone number as the primary identifier (required in register form)
- Password-based login
- No OTP/SMS required for login

Supabase's phone provider requires OTP SMS delivery (via Twilio). Forcing phone into the email field (e.g. `+919876543210@auth.local`) is a hack that creates problems: Supabase tries to send confirmation emails to these addresses, the forgot-password flow breaks, and future Supabase updates may reject synthetic email formats.

### Recommended solution (what is implemented)

**Use email + password for Supabase Auth. Collect phone separately in the profile.**

Concretely:
- **Register form**: Full Name (required), Phone (required, stored in `profiles.phone`), **Email (required, used as Supabase auth identifier)**, Password
- **Login form**: Email + Password (field label: "Email address")
- **`profiles` table**: Phone number stored and displayed as the primary contact field everywhere else in the app (dashboard, admin views, booking flow)
- **Auth**: Supabase `signUpWithPassword({ email, password })` — fully supported, no workarounds

This means email is required (changed from "optional" in the original spec). For a business booking system, requiring an email is reasonable and standard. Customers who genuinely have no email can be added manually by the admin via the admin panel.

### What this changes vs the planning documents

| Document | Original | Change |
|---|---|---|
| `IMPLEMENTATION_PLAN.md` | Register: email optional | Register: email required (for auth) |
| `COMPONENT_ARCHITECTURE.md` | LoginForm: "Phone or email" field | LoginForm: "Email" field |
| `DEPLOYMENT_PLAN.md` | SMS OTP for forgot password | Email reset link via Supabase |
| `DEPLOYMENT_PLAN.md` | Twilio setup required | No Twilio needed at launch |

The login **UI** still shows the phone number field on the register form and the phone is the primary contact throughout the app — this is unchanged. The only change is that Supabase Auth uses email as the underlying identifier.

### Alternative considered and rejected

**Synthetic email from phone**: Create `+91XXXXXXXXXX@auth.sakshibeautyparlour.in` as the email in Supabase, accept just the phone in the UI. Rejected because: Supabase sends confirmation emails to this address (which doesn't exist), the email domain must be set up and working, Supabase Auth assumptions about email validity may cause issues, and this creates a brittle system that fights the platform.

---

## Future blockers will be added here
