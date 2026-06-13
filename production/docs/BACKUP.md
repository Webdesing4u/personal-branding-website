# Backup & Disaster Recovery Strategy

**Status:** Documented · Automation noted per item
**Owner:** Emran Hossain
**Last reviewed:** (update on every audit)

---

## 1. Database — Neon PostgreSQL

### 1.1 Point-in-Time Recovery (PITR) — primary safety net
- Neon retains WAL history allowing restore to **any second** within the retention window.
- **Action required (one-time):** Neon Console → Project → Settings → *History retention*
  - Free tier: 24h (default 6h — raise it)
  - Launch plan: set to **7 days** (recommended minimum for this project)
- Restore procedure: Console → Branches → *Restore* → pick timestamp → creates a new branch
  → verify data → promote or repoint `DATABASE_URL`.
- **RPO:** seconds · **RTO:** ~10 minutes

### 1.2 Daily automated backup (logical dump)
PITR protects against data loss; logical dumps protect against **account/provider loss**.

GitHub Actions workflow (`.github/workflows/db-backup.yml`):
```yaml
name: Nightly DB backup
on:
  schedule: [{ cron: "0 21 * * *" }]   # 03:00 Asia/Dhaka
jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - run: |
          pg_dump "$DIRECT_URL" --format=custom --no-owner \
            --file="backup-$(date +%F).dump"
        env:
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
      - uses: actions/upload-artifact@v4
        with:
          name: db-backup-${{ github.run_id }}
          path: backup-*.dump
          retention-days: 30
```
For long-term retention, push the dump to a private S3/R2 bucket instead of artifacts.

### 1.3 Weekly manual export (verified restore)
- Every Sunday: `pg_dump --format=custom` to local encrypted disk.
- **Monthly restore drill:** restore the latest dump into a scratch Neon branch and
  run `SELECT count(*)` on all 14 tables. *A backup that has never been restored
  is not a backup.*

---

## 2. Environment Variables
- **Source of truth:** Vercel project env settings (production + preview).
- **Backup copy:** encrypted in a password manager vault (1Password/Bitwarden)
  as a single secure note titled `emranhossain.com — env (prod)`.
- Update the vault **in the same sitting** as any env change in Vercel.
- `NEXTAUTH_SECRET` rotation: generate new → add to Vercel → redeploy →
  all sessions invalidate (admins re-login). Document rotation date in the vault note.
- ⚠ Never commit `.env` — `.gitignore` already covers it; verify on every repo clone.

---

## 3. Media — Cloudinary

### 3.1 Folder naming convention (enforced by the upload API)
```
blog/         featured images for blog posts
portfolio/    project featured images + galleries
business/     venture logos
gallery/      public gallery images
```
The signed-upload route whitelists exactly these four folders — uploads cannot
land anywhere else. **Do not create ad-hoc folders manually.**

### 3.2 Backup posture
- Cloudinary stores assets redundantly; the **DB row is the source of truth**
  (an asset not referenced in the DB is garbage, not data).
- Quarterly: export the asset list via Cloudinary Admin API
  (`GET /resources/image?prefix=` per folder) and store the JSON alongside the
  weekly DB dump — this allows re-linking if a DB restore goes far back.
- Deleting a DB row does NOT delete the Cloudinary asset (intentional —
  prevents data loss on accidental deletes; orphans are cleaned quarterly).

---

## 4. Code & Configuration
- Git on GitHub = primary code backup (plus every Vercel deployment is an
  immutable snapshot — instant rollback via "Promote previous deployment").
- Prisma migrations live in `prisma/migrations/` — **never edit applied
  migrations**; roll forward with new ones.

---

## 5. Failure Recovery Runbook

| Scenario | Action | Target time |
|---|---|---|
| Bad deploy (broken page) | Vercel → previous deployment → Promote | < 2 min |
| Bad migration applied | Neon PITR restore to pre-migration timestamp → repoint → fix migration → re-apply | < 30 min |
| Accidental content delete (admin) | PITR branch at T-1min → copy row(s) back via SQL | < 20 min |
| Neon total outage | Restore latest nightly dump to any Postgres (Supabase/RDS) → update `DATABASE_URL` | < 2 h |
| Cloudinary outage | Images 404 but site stays up (next/image fails soft) — wait or repoint to mirror | n/a |
| Leaked secret | Rotate the secret at the provider → update Vercel env → redeploy → audit access logs | < 1 h |
| Admin lockout | Re-run seed with new `ADMIN_PASSWORD` (`npx prisma db seed` upserts the hash) | < 10 min |

---

## 6. Review cadence
- **Monthly:** restore drill (1.3)
- **Quarterly:** Cloudinary asset-list export + orphan cleanup
- **On every audit:** update "Last reviewed" above
