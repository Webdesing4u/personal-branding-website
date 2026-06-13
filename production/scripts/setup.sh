#!/usr/bin/env bash
# One-time setup after copying production/ into your Next.js project root.
# Run from the project root:  bash scripts/setup.sh
set -euo pipefail

echo "▶ Emran Hossain site — post-copy setup"

# 1 — Rename the NextAuth catch-all route (sandbox could not create '[...nextauth]')
SRC="app/api/auth/nextauth-catchall"
DST="app/api/auth/[...nextauth]"
if [ -d "$SRC" ]; then
  mkdir -p "$DST"
  mv "$SRC/route.ts" "$DST/route.ts"
  rmdir "$SRC"
  # Strip the rename reminder comment from the top of the file
  sed -i.bak '1,4d' "$DST/route.ts" && rm -f "$DST/route.ts.bak"
  echo "✔ Renamed $SRC → $DST"
else
  if [ -d "$DST" ]; then
    echo "✔ NextAuth route already at $DST — nothing to do"
  else
    echo "✘ ERROR: NextAuth route not found at $SRC or $DST" >&2
    exit 1
  fi
fi

# 2 — Rename reference configs
[ -f "package.reference.json" ] && echo "ℹ Merge package.reference.json into package.json manually (deps + prisma.seed)"
if [ -f "next.config.reference.mjs" ] && [ ! -f "next.config.mjs" ]; then
  mv next.config.reference.mjs next.config.mjs
  echo "✔ Renamed next.config.reference.mjs → next.config.mjs"
fi

# 3 — Env sanity check
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠ Created .env from .env.example — FILL IN ALL VALUES before running"
fi

REQUIRED_VARS=(DATABASE_URL DIRECT_URL NEXTAUTH_SECRET RESEND_API_KEY \
  UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN RECAPTCHA_SECRET_KEY \
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY CLOUDINARY_CLOUD_NAME CLOUDINARY_API_KEY \
  CLOUDINARY_API_SECRET NEXT_PUBLIC_SITE_URL ADMIN_EMAIL ADMIN_PASSWORD)

MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if ! grep -q "^${VAR}=\".\+\"" .env 2>/dev/null && ! grep -q "^${VAR}=.\+" .env 2>/dev/null; then
    echo "  ✘ missing or empty: $VAR"
    MISSING=1
  fi
done
if [ "$MISSING" -eq 1 ]; then
  echo "⚠ Fill the variables above in .env, then run:"
else
  echo "✔ All required env vars present. Next steps:"
fi

cat <<'EOF'

  npx prisma migrate dev --name init
  npx prisma db seed
  npm run dev

EOF
echo "▶ Setup complete."
