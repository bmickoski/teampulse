# TeamPulse

A team productivity SaaS dashboard built with Next.js 15 and React 19. Manage projects, track progress, and keep your team in sync.

**Live demo:** https://teampulse-ecru-sigma.vercel.app

## Features

- **Authentication** - email/password sign-up and sign-in with NextAuth v5
- **Organizations** - create an org, invite team members, manage roles (owner/member)
- **Pulses** - create and track projects with status (active, completed, archived)
- **Pulse detail** - full history of changes per pulse with activity log
- **Real-time activity feed** - live updates via Server-Sent Events (SSE)
- **Role-based access** - owners can manage team and org settings, members have read access
- **Pagination** - infinite scroll on pulses list with URL-based status filtering

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| Database | Neon (PostgreSQL, serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth v5 (JWT) |
| Styling | Tailwind CSS v4, shadcn/ui |
| Forms | React Hook Form + Zod |
| Server state | TanStack React Query v5 |
| Client state | Zustand |
| URL state | nuqs |
| Charts | Recharts |
| Toasts | Sonner |
| Testing | Vitest, React Testing Library |

## Architecture highlights

- **App Router** with nested layouts, parallel routes, and intercepting routes (modal pattern)
- **Server Components** for data fetching with Suspense streaming
- **Server Actions** for mutations with two-layer validation (client + server)
- **Optimistic UI** with React Query cache invalidation
- **Role-based middleware** - edge-level redirects + server action guards + UI gating

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) database

### Setup

```bash
git clone https://github.com/your-username/teampulse
cd teampulse
npm install
```

Copy the environment variables file and fill in your values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=        # Neon connection string
AUTH_SECRET=         # Random secret (run: openssl rand -hex 32)
```

Push the database schema:

```bash
npx drizzle-kit push
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Running tests

```bash
npm test          # watch mode
npm test -- --run # single run
```

## Project structure

```
src/
  app/                  # Next.js App Router pages
    (auth)/             # Sign-in, sign-up
    dashboard/          # Protected dashboard
      @modal/           # Parallel route for pulse detail modal
      pulses/           # Pulses list + detail page
      team/             # Team management
      settings/         # Profile + org settings
  components/           # Shared UI components
  context/              # React Context (user context)
  db/                   # Drizzle schema and client
  lib/
    actions/            # Server actions
    validations/        # Zod schemas
    utils/              # Pure utility functions
  test/                 # Vitest tests
```
