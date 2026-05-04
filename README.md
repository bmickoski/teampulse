# TeamPulse

A team task management app built with Next.js 16 and React 19. Organizations create and track work items called pulses, assign them to team members, and collaborate through comments.

## Features

- Pulse management with status, priority, due dates, and assignees
- @mentions in comments with in-app and email notifications
- Real-time activity feed via SSE
- Notification center with per-type icons and mark-all-read
- Global search with Cmd+K
- Dashboard with charts (pulses by status, member workload, creation over time)
- Multi-org support with org switching
- Invite members by email or shareable invite link
- Role-based access (owner vs member)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL on Neon, Drizzle ORM
- **Auth:** NextAuth v5 (credentials)
- **Styling:** Tailwind CSS v4, shadcn/ui
- **State:** Zustand, TanStack Query
- **Email:** Resend
- **Testing:** Vitest, React Testing Library

## Running locally

```bash
npm install
```

Create `.env.local`:

```
DATABASE_URL=
DIRECT_DATABASE_URL=
NEXTAUTH_SECRET=
RESEND_API_KEY=
```

`DATABASE_URL` is the pooled Neon connection string. `DIRECT_DATABASE_URL` is the direct (non-pooled) connection used for migrations.

```bash
npm run dev
```

Migrations run automatically on `npm run build` via a `postbuild` script. For local development run:

```bash
npx drizzle-kit push
```

## Deployment

Deployed on Vercel. Production database is a separate Neon branch from development. Migrations apply automatically on each production build.
