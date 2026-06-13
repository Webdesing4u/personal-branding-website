# Emran Hossain — Production Backend (Next.js 14)

Real, deployable backend. No simulations. Copy this folder into a fresh Next.js project
(or use it as the project root) and follow the steps below.

## Tech Lock ✅
- Next.js 14 (App Router) · TypeScript
- Prisma + PostgreSQL (Neon)
- NextAuth (Credentials + JWT, bcrypt)
- Zod validation (shared client/server)
- Resend (transactional email)
- Upstash Redis (rate limiting)
- Tailwind CSS

## 1 — Setup

```bash
npx create-next-app@14 emran-site --typescript --tailwind --app --src-dir=false
cd emran-site
# copy everything from this production/ folder into the project root (overwrite)

bash scripts/setup.sh   # renames [...nextauth], configs, env sanity check

npm i @prisma/client next-auth bcryptjs zod resend @upstash/ratelimit @upstash/redis \
  react-markdown remark-gfm rehype-slug rehype-autolink-headings
npm i -D prisma @types/bcryptjs tsx
```

> `scripts/setup.sh` is **required** — it renames `app/api/auth/nextauth-catchall/`
> to `app/api/auth/[...nextauth]/` (this folder name could not be created in the
> authoring sandbox) and verifies all env vars are present.

## 2 — Environment Variables

Copy `.env.example` → `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string (pooled) |
| `DIRECT_URL` | Neon → Direct connection (for migrations) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` (prod: your domain) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `CONTACT_TO_EMAIL` | Your inbox for contact notifications |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | console.upstash.com → Redis DB |
| `RECAPTCHA_SECRET_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA v3 admin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed credentials (password gets bcrypt-hashed) |

## 3 — Database

```bash
npx prisma migrate dev --name init   # creates all 14 tables on Neon
npx prisma db seed                   # admin user + categories + sample content
```

`package.json` needs:
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

## 4 — Run & Deploy

```bash
npm run dev                          # local
```

**Vercel deploy:**
1. Push to GitHub → Import in Vercel
2. Add all env vars (use Neon **pooled** URL for `DATABASE_URL`)
3. Build command: `prisma generate && next build`
4. Done — ISR, sitemap, OG images all work automatically

## Architecture

```
app/
  (public)/
    blog/                 ISR pages + JSON-LD + dynamic metadata
      [slug]/
        page.tsx
        opengraph-image.tsx
    portfolio/[slug]/     SSG via generateStaticParams
  admin/                  Protected by middleware (real session check)
    login/
  api/
    auth/[...nextauth]/   NextAuth (bcrypt + JWT)
    contact/              Zod + reCAPTCHA + rate limit + DB + Resend
    admin/posts/          Authenticated CRUD
  sitemap.ts              Auto-generated from DB
  robots.ts
lib/
  db.ts                   Prisma singleton
  auth.ts                 NextAuth options
  validations.ts          Zod schemas (shared)
  rate-limit.ts           Upstash sliding window
  email.ts                Resend
  recaptcha.ts            Server-side token verify
middleware.ts             /admin + /api/admin protection
prisma/
  schema.prisma           14 production tables
  seed.ts
```

## Security Checklist ✅
- [x] Passwords bcrypt-hashed (cost 12), never stored plain
- [x] JWT sessions, httpOnly cookies (NextAuth defaults)
- [x] middleware.ts blocks /admin & /api/admin without valid token + admin role
- [x] All inputs validated server-side with Zod
- [x] Rate limiting: 5 contact submissions / 10 min / IP
- [x] reCAPTCHA v3 verified server-side with score threshold
- [x] All secrets in env vars — nothing in code
- [x] SQL injection impossible (Prisma parameterized queries)
