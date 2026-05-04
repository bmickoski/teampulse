<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project overview

TeamPulse is a team task management app. The core concept is a "pulse" (a task/work item). Users belong to organizations, create pulses, assign them to members, and track progress.

## Key conventions

- Server actions live in `src/lib/actions/`. Every action checks `getCurrentUserWithOrg()` first and returns early on auth failure.
- DB queries live in `src/lib/pulses.ts` and similar files, not in actions or components.
- Shared types are in `src/lib/types.ts`. Do not duplicate types inline if one already exists.
- Color constants for pulse status and priority are in `src/lib/utils/pulse.ts`. Use those, do not add new ones.
- `params` and `searchParams` in server components are Promises in this version of Next.js. Always `await params` before accessing properties.
- Client components that need `searchParams` must use `React.use(searchParams)`.

## Database

- ORM: Drizzle with PostgreSQL (Neon)
- Schema: `src/db/schema.ts`
- Migrations: `migrations/` folder. Run `npx drizzle-kit generate` then `npx drizzle-kit migrate` for production, `npx drizzle-kit push` for local dev.
- Two connection strings: `DATABASE_URL` (pooled, for runtime) and `DIRECT_DATABASE_URL` (direct, for migrations).
- Soft deletes on pulses via `deletedAt`. Always filter with `isNull(pulsesTable.deletedAt)`.

## Auth

NextAuth v5 (credentials provider). Use `getCurrentUser()` for user only, `getCurrentUserWithOrg()` when you also need org context and role.

## Notifications

`createNotifications()` in `src/lib/notifications.ts`. Always pass the correct `NotificationType`. Do not infer type from message text.

