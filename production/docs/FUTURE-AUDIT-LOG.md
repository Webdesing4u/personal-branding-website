# Future: Admin Audit Log (NOT implemented — by decision)

**Trigger condition:** implement this the day a SECOND admin user or any
non-admin role (editor, author) is added. Single-admin systems don't need it;
multi-actor systems can't live without it.

## Planned schema (add to schema.prisma when triggered)

```prisma
model AdminLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id") @db.Uuid
  action     String   @db.VarChar(50)   // create | update | delete | login | publish
  entity     String   @db.VarChar(50)   // blog_post | project | venture | gallery | message
  entityId   String?  @map("entity_id") @db.Uuid
  diff       Json?                       // { before: {...}, after: {...} } — changed fields only
  ipAddress  String?  @map("ip_address") @db.VarChar(50)
  createdAt  DateTime @default(now()) @map("created_at")
  user       User     @relation(fields: [userId], references: [id], onDelete: Restrict)

  @@index([entity, entityId])
  @@index([userId, createdAt])
  @@map("admin_logs")
}
```

## Integration point (already exists)

Every mutation flows through `guardAdmin()` in `lib/admin-api.ts` and returns
`userId` — the logging call slots in with one helper:

```ts
// lib/audit.ts (future)
export async function logAdminAction(opts: {
  userId: string; action: string; entity: string;
  entityId?: string; diff?: unknown; ip?: string;
}) {
  await db.adminLog.create({ data: { ...opts, diff: opts.diff as Prisma.JsonValue } });
}
```

Call it after each successful mutation in the CRUD routes (~2 lines per route,
~15 call sites). Fire-and-forget (`void`) — logging must never fail a mutation.

## Rules when implemented
- Logs are **append-only** — no UPDATE/DELETE route for admin_logs, ever
- `onDelete: Restrict` on user — can't delete a user who has history
- Retention: 12 months, then archive to cold storage with the weekly dump
- Login failures also logged (action: `login_failed`, userId nullable variant)
