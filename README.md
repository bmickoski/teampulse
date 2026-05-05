# TeamPulse

A team task management app built with Next.js 16 and React 19. Organizations create and track work items called pulses, assign them to team members, and collaborate through comments.

**Live:** [teampulse-ecru-sigma.vercel.app](https://teampulse-ecru-sigma.vercel.app/)

## Features

- Pulse management with status, priority, due dates, and assignees
- @mentions in comments with styled rendering, in-app and email notifications
- Real-time activity feed via SSE
- Notification center with per-type icons, relative timestamps, and mark-all-read
- Global search with Cmd+K and keyboard navigation
- Dashboard with customizable charts (pulses by status, member workload, creation over time)
- Multi-org support with org switching
- Invite members by email or shareable invite link
- Role-based access (owner vs member)
- Pulse templates (Bug Report, Feature Request, General Task)
- Due date reminders via daily Vercel cron job
- Onboarding checklist for new organizations
- Mobile responsive with collapsible sidebar

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
CRON_SECRET=
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

Deployed on Vercel. Production database is a separate Neon branch from development. Migrations apply automatically on each production build. The cron job for due date reminders runs daily at 8am UTC.
