# Deployment Plan — Sakshi Beauty Parlour

---

## Tech Stack

| Layer | Choice | Version / Notes |
|---|---|---|
| Framework | Next.js App Router | Latest stable at implementation time (currently 15.x) |
| Styling | Tailwind CSS | v4.x |
| UI primitives | shadcn/ui | Latest; only install components actually used |
| Animation | Framer Motion | v11.x |
| Database + Auth + Storage | Supabase | Managed Postgres, GoTrue auth, S3-compatible storage |
| Supabase client | `@supabase/ssr` | Correct package for Next.js App Router; handles cookie-based sessions |
| Forms | react-hook-form + zod | Consistent form validation; same schema used client + server |
| Toast notifications | sonner | Minimal, premium-looking toasts; fits the design aesthetic |
| Fonts | Google Fonts (Cormorant Garamond, Dancing Script, Jost) | Via `next/font/google` for optimal performance |
| Deployment | Vercel | Single project; frontend + backend in one |
| Image hosting | Supabase Storage | Public bucket `gallery`; served via Supabase CDN |

---

## Auth Architecture

### Provider: Supabase Auth
Phone number + password login as the primary auth method. This is appropriate because:
- The registration form makes phone number required and email optional
- Indian salon clients are more likely to remember their phone number than an email login
- OTP for password reset is delivered to a phone number that every customer will have

### Session handling: `@supabase/ssr`
Not the deprecated `@supabase/auth-helpers-nextjs`. The `@supabase/ssr` package uses cookie-based sessions compatible with Next.js App Router Server Components and middleware.

Two Supabase client instances are required:
1. **Server client** (`createServerClient`) — used in Server Components, Server Actions, and middleware. Reads/writes the session cookie.
2. **Browser client** (`createBrowserClient`) — used in Client Components for auth state listening and Storage uploads.

### Middleware (auth guard)
`middleware.ts` at the project root:
- Refreshes the session cookie on every request
- Checks `profile.role` for `/admin/*` routes → redirect non-admins to `/login`
- Checks session existence for `/dashboard/*` routes → redirect unauthenticated users to `/login`
- Redirects logged-in users away from `/login` to `/dashboard`

### Forgot Password — Recommendation: OTP via SMS

**Recommendation**: SMS OTP via Supabase Phone Auth (built-in, uses Twilio under the hood) is the correct approach for this app. The design already says "reset link or OTP" — OTP is better for the following reasons:

1. **Email is optional** in the registration form. A meaningful subset of customers may not have an email on file, making email-based reset links unreliable.
2. **Phone is required** for registration. Every customer will have a phone number.
3. **Indian salon customers** are far more comfortable with OTP SMS (it's the universal recovery mechanism for Indian apps — banking, UPI, e-commerce all use it).
4. **Faster**: OTP is instant; email reset links require the user to open a different app, which breaks the mobile browser flow.

**Implementation**:
- Supabase Auth has built-in OTP via phone (requires Twilio credentials in Supabase settings)
- `supabase.auth.signInWithOtp({ phone: '+91...' })` sends OTP
- User enters OTP in a second form step
- On OTP verify → session established → user sets new password

**Alternative if SMS cost is a concern**: Email magic link (not reset link — magic link logs them straight in without a password step, then they can change the password from their profile). This is better UX than a reset link but requires a valid email. Given email is optional here, SMS OTP is the stronger primary recommendation.

---

## Server Actions vs Route Handlers — Per-Feature Recommendation

The key distinction: **Server Actions** are tightly coupled to form submissions and component mutations. **Route Handlers** are for external integrations, webhooks, and API endpoints consumed by third parties or mobile apps.

| Feature | Mechanism | Reason |
|---|---|---|
| Create appointment | **Server Action** | Form submission from BookingWizard; directly invoked from client component; no external caller |
| Create booking | **Server Action** | Same as above |
| Cancel appointment/booking | **Server Action** | Button-triggered mutation in Dashboard; no external caller |
| Contact form submit | **Server Action** | Form in ContactForm component |
| Admin: edit service/appointment/booking | **Server Action** | Admin drawer save button; internal UI mutation |
| Admin: delete record | **Server Action** | Internal UI action |
| Admin: block/unblock slot | **Server Action** | SlotGrid cell click |
| Admin: update booking status (approve) | **Server Action** | Admin UI action |
| Gallery image metadata create/edit | **Server Action** | After Storage upload; saves row to DB |
| Login / Register / Forgot | Supabase Auth SDK directly | Auth is handled by Supabase client; not a Server Action |
| Future: webhook from payment provider | **Route Handler** | External caller (Razorpay, etc.) needs a URL endpoint |
| Future: SMS webhook from Twilio | **Route Handler** | External caller |
| Supabase Storage upload | Supabase Storage SDK (client-side) | Direct browser-to-Storage upload is the correct Supabase pattern; avoids routing large files through Vercel functions |

**Summary**: Almost everything in this app is a Server Action. Route Handlers are reserved for the future external integrations.

---

## Environment Variables

### Required for all environments

```env
# Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co

# Supabase anon key (public — safe to expose in client code)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase service role key (SECRET — server-only, never expose to browser)
# Used only in scripts (seeding) and admin-privileged operations
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Optional (P1)
```env
# For email notifications to admin on new bookings
# Can be Supabase SMTP config, or Resend, or SendGrid
ADMIN_EMAIL=sakshi@sakshibeautyparlour.in

# Twilio (for SMS OTP on forgot password — required if using phone OTP)
# These are configured in Supabase dashboard, not in .env
# (Supabase handles Twilio integration server-side)
# No Twilio credentials needed in the Next.js app directly

# Site URL (used in auth redirect URLs)
NEXT_PUBLIC_SITE_URL=https://sakshibeautyparlour.in
```

### Production-only (in Vercel dashboard)
```env
# All NEXT_PUBLIC_ vars above
# SUPABASE_SERVICE_ROLE_KEY (never committed to repo)
# NEXT_PUBLIC_SITE_URL set to production domain
```

### Local development
```env
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Vercel Deployment Architecture

The entire application deploys as a **single Vercel project**. No separate server. Everything runs on Vercel's edge/serverless infrastructure.

```
Vercel Project: sakshi-beauty-parlour
├── Frontend: Next.js static pages + RSC streaming (Vercel CDN)
├── Backend: Next.js Server Actions + API Routes (Vercel Serverless Functions)
├── Database: Supabase (external managed Postgres — not on Vercel)
└── Storage: Supabase Storage (external S3-compatible — not on Vercel)
```

### Vercel settings
- **Framework preset**: Next.js (auto-detected)
- **Build command**: `next build`
- **Output directory**: `.next` (auto-detected)
- **Node.js version**: 20.x (LTS)
- **Regions**: `bom1` (Mumbai) — closest to Pune, India. Minimizes latency for Indian users.

### Branches and environments
| Branch | Environment | URL |
|---|---|---|
| `main` | Production | `sakshibeautyparlour.in` (custom domain) |
| `develop` | Preview | `[branch]-sakshi.vercel.app` |
| Feature branches | Preview per PR | Auto-generated |

### Supabase URL allowlist
In Supabase Auth settings, add all Vercel preview URLs pattern + production URL to the allowed redirect URLs list:
```
http://localhost:3000/**
https://sakshi-beauty-parlour.vercel.app/**
https://*-sakshi.vercel.app/**
https://sakshibeautyparlour.in/**
```

---

## Supabase Storage Bucket Structure

### Buckets

**`gallery`** (public read access):
```
gallery/
  work/
    IMG_20260119_133106.jpg
    IMG_20260119_133218.jpg
    IMG_20260119_133251.jpg
    IMG_20260119_133440.jpg
    IMG_20260119_134338.jpg
    IMG_20260119_134354.jpg
    IMG-20260607-WA0001.jpg
    IMG-20260607-WA0004.jpg
  achievement/
    FB_IMG_1782645430924.jpg
    IMG_1233.jpg
    IMG_1234.jpg
    IMG_1235.jpg
    IMG_1236.jpg
    IMG_1237.jpg
    IMG_1238.jpg
    IMG_1240.jpg
    IMG_1241.jpg
    IMG_1242.jpg
    IMG_1246.jpg
    IMG_1247.jpg
    IMG_1248.jpg
    IMG_1249.jpg
    IMG_1250.jpg
    IMG_1251.jpg
    IMG_1252.jpg
    IMG_1253.jpg
    IMG_1254.jpg
    IMG_1257.jpg
    IMG_1260.jpg
```

**`avatars`** (private, owner-read, admin-read):
```
avatars/
  [user-uuid].jpg
```

### Storage RLS policies

```sql
-- gallery bucket: anyone can read
CREATE POLICY "gallery_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

-- gallery bucket: only admin can upload/delete
CREATE POLICY "gallery_admin_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gallery' AND is_admin());

CREATE POLICY "gallery_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'gallery' AND is_admin());

-- avatars bucket: owner reads own, admin reads all
CREATE POLICY "avatars_owner_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "avatars_admin_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars' AND is_admin());

CREATE POLICY "avatars_owner_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## Image Seeding from `./work/` and `./acheivement/`

A seed script (`scripts/seed-images.ts`) handles this one-time task. Run it locally before launch.

### Step 1: Convert HEIC to JPEG
The 19 HEIC files in `acheivement/` cannot be served on the web. Convert them before seeding:

```bash
# Install heic-convert (Node.js tool)
npm install -g heic-convert

# Or use ImageMagick if available on the system
for f in acheivement/*.HEIC; do
  convert "$f" "${f%.HEIC}.jpg"
done
```

The seed script handles this conversion step automatically using the `heic-convert` npm package.

### Step 2: Seed script (`scripts/seed-images.ts`)

```typescript
// Run with: npx tsx scripts/seed-images.ts
// Requires: SUPABASE_SERVICE_ROLE_KEY in .env.local

import { createClient } from '@supabase/supabase-js';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import convert from 'heic-convert';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // service role bypasses RLS
);

const WORK_DIR = './work';
const ACHIEVEMENT_DIR = './acheivement';

async function seedImages() {
  await seedDirectory(WORK_DIR, 'work');
  await seedDirectory(ACHIEVEMENT_DIR, 'achievement');
}

async function seedDirectory(dir: string, section: 'work' | 'achievement') {
  const files = await readdir(dir);
  for (const filename of files) {
    const filepath = join(dir, filename);
    let buffer = await readFile(filepath);
    let uploadName = filename;

    // Convert HEIC to JPEG
    if (filename.toLowerCase().endsWith('.heic')) {
      const outputBuffer = await convert({
        buffer: buffer,
        format: 'JPEG',
        quality: 0.92,
      });
      buffer = Buffer.from(outputBuffer);
      uploadName = filename.replace(/\.HEIC$/i, '.jpg');
    }

    const storagePath = `${section}/${uploadName}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(storagePath, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error(`Failed to upload ${filename}:`, uploadError.message);
      continue;
    }

    // Insert metadata row
    const { error: dbError } = await supabase.from('gallery_images').upsert({
      title: filenameToTitle(uploadName),
      category: section === 'work' ? 'Bridal transformations' : 'Achievements',
      tag: section === 'work' ? 'Work' : 'Achievement',
      section,
      storage_path: storagePath,
      alt_text: filenameToTitle(uploadName),
    }, { onConflict: 'storage_path' });

    if (dbError) {
      console.error(`Failed to save metadata for ${filename}:`, dbError.message);
    } else {
      console.log(`✓ Seeded: ${storagePath}`);
    }
  }
}

function filenameToTitle(filename: string): string {
  return filename.replace(/\.(jpg|jpeg|heic|png)$/i, '').replace(/[-_]/g, ' ');
}

seedImages().catch(console.error);
```

**Important**: After seeding, the admin should update the `title`, `category`, and `tag` fields for each image via the admin gallery panel to match the actual content of the photos.

---

## Image Optimization, Caching, and Performance

This is a gallery-heavy site with a mobile audience on Indian mobile networks (4G with variable speeds). Image performance is critical.

### Next.js Image Optimization (`next/image`)
Use `<Image>` from `next/image` for all content images:
- Automatic WebP/AVIF conversion
- Responsive `srcset` generation
- Lazy loading by default (only LCP image above the fold should be `priority={true}`)
- Proper `sizes` attribute to avoid loading desktop-sized images on mobile

```tsx
// Gallery tile example
<Image
  src={supabasePublicUrl}
  alt={image.alt_text}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  className="object-cover"
/>
```

### Supabase Storage image transforms
Supabase Storage supports on-the-fly image transformation via query params. Use this for thumbnails:

```
https://[project].supabase.co/storage/v1/render/image/public/gallery/work/IMG_123.jpg?width=800&quality=80
```

This avoids sending full-resolution images when thumbnails suffice. Use in gallery tiles; full resolution only in the lightbox.

### Vercel CDN caching
Vercel caches Next.js static pages and Image Optimization responses at the edge. Ensure:
- `Cache-Control` headers are appropriate (Vercel handles this automatically for static assets)
- Supabase Storage CDN serves images from their global CDN (Supabase uses a CDN by default for public buckets)
- Gallery images are served from Supabase Storage URLs directly (not proxied through Vercel) to leverage Supabase's CDN

### Next.js `remotePatterns` for Supabase
In `next.config.ts`:
```typescript
const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '[project-ref].supabase.co',
        pathname: '/storage/v1/**',
      },
    ],
  },
};
```

### Google Fonts optimization
Use `next/font/google` — this downloads fonts at build time and self-hosts them on Vercel:
```typescript
import { Cormorant_Garamond, Dancing_Script, Jost } from 'next/font/google';
```
This eliminates the runtime Google Fonts network request, critical for users on slow connections.

### Performance strategies per page type

**Home page (image-heavy)**:
- Hero portrait image: `priority={true}` (it's above the fold LCP)
- Gallery preview strip: lazy load all 4 tiles
- Use low-quality image placeholder (LQIP) with `blurDataURL` for the hero image

**Gallery page (most image-heavy)**:
- All tiles are lazy-loaded (below fold)
- Thumbnail size: 600px wide max (sufficient for the 300px display tiles)
- Lightbox: loads full-resolution only when opened
- Consider pagination or "load more" for large galleries (if gallery grows beyond 30+ images)

**Services page**:
- No real images — only CSS gradient placeholders. No image optimization needed.

**Mobile network strategy**:
- The `sizes` attribute on every `<Image>` is non-negotiable — mobile users must not download 1200px images for 300px tiles
- Prefer WebP (supported by 95%+ of Indian mobile browsers in 2026)
- The Supabase Storage CDN has edge nodes in India — latency is low for storage fetches

### Page caching strategy

| Page | Cache | Reason |
|---|---|---|
| Home | Static (ISR, revalidate: 3600) | Rarely changes; content from DB |
| Services | Static (ISR, revalidate: 3600) | Prices change infrequently |
| Gallery | Static (ISR, revalidate: 1800) | New images added by admin periodically |
| About | Static (ISR, revalidate: 86400) | Rarely changes |
| Contact | Static (ISR, revalidate: 86400) | Rarely changes |
| Book | Dynamic (no cache) | Slot availability must be real-time |
| Dashboard | Dynamic (no cache) | User-specific data |
| Admin | Dynamic (no cache) | Admin data must be live |

ISR = Incremental Static Regeneration. The page is cached on Vercel CDN and regenerated in the background when a request comes in after the revalidation window.

---

## Supabase Project Setup Checklist

Before deploying:

1. Create Supabase project (region: `ap-south-1` — Mumbai)
2. Run `schema.sql` in Supabase SQL Editor
3. Enable Phone Auth in Authentication → Providers → Phone
4. Configure Twilio credentials in Supabase for SMS OTP
5. Create `gallery` and `avatars` Storage buckets (public and private respectively)
6. Apply Storage RLS policies
7. Run seed script: `npx tsx scripts/seed-images.ts`
8. Seed initial service data (can be done via Supabase Studio or a separate seed script)
9. Create the first admin user: register normally, then run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE phone = '+91XXXXXXXXXX';
   ```
10. Add Vercel preview URL patterns to Supabase Auth redirect allowlist
11. Set all environment variables in Vercel dashboard

---

## Project File Structure (top-level)

```
sakshi-parlour/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # createBrowserClient
│   │   ├── server.ts       # createServerClient (for Server Components/Actions)
│   │   └── middleware.ts   # createServerClient for middleware.ts
│   └── utils.ts            # cn(), formatPrice(), formatDate(), etc.
├── actions/                # Server Actions (one file per domain)
│   ├── appointments.ts
│   ├── bookings.ts
│   ├── contact.ts
│   ├── gallery.ts
│   └── services.ts
├── types/
│   └── database.ts         # Generated Supabase types (npx supabase gen types)
├── scripts/
│   └── seed-images.ts      # One-time image seeding script
├── public/                 # Static assets (favicon, og-image)
├── design/                 # Design files (reference only, not served)
├── work/                   # Source images (used by seed script, not served)
├── acheivement/            # Source images (used by seed script, not served)
├── middleware.ts            # Auth guard middleware
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── IMPLEMENTATION_PLAN.md
├── DATABASE_DESIGN.md
├── COMPONENT_ARCHITECTURE.md
└── DEPLOYMENT_PLAN.md
```
