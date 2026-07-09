# OpsData Hub

**Operations Analytics on HubSpot** — a demo-ready analytics platform that turns raw pipeline, service, and productivity activity into decisions your team can act on.

OpsData Hub gives revenue and support teams one workspace to watch deals move through the funnel, track SLA health, and catch data-quality problems before they quietly break a report — all scoped to who's looking, so an Admin, a Manager, and a Rep never see the same thing.

> This build runs entirely on seeded demo data in Supabase, not a live HubSpot connection. Everything you see — the numbers, the stalled deals, the tickets — is real data seeded into a real database and queried with real row-level security, just not synced from an actual HubSpot portal yet.

---

## What's inside

- **Executive Overview** — pipeline value, win rate, SLA attainment, and rep activity at a glance, plus a Stalled Deals widget that flags deals aging well past their stage's normal pace.
- **Pipeline** — stage funnel with bottleneck highlighting, deals by owner, and quota attainment.
- **Service SLA** — first-response and resolution times, attainment by priority, backlog aging.
- **Data Quality** — completeness scoring, orphaned-owner detection, and a "records needing attention" queue — because a dashboard is only as trustworthy as the data behind it.
- **Universal drill-through** — click almost any number, bar, or row and a panel opens with the exact records behind it, a reconciliation total, and a CSV export. If a tile says it, the drill-through can prove it.
- **Role-based access** — Admin (sees everything), Manager (their team), and Rep (their own book) are enforced with Postgres Row Level Security, not just hidden in the UI.
- **One-click role switching on login** — pick a role from the dropdown and the demo credentials fill in for you, so anyone can explore all three perspectives without needing real login details.

## Tech stack

| | |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Components, Turbopack) |
| UI | React 19, Tailwind CSS v4, [Framer Motion](https://www.framer.com/motion/), [Recharts](https://recharts.org) |
| Backend | [Supabase](https://supabase.com) (Postgres, Auth, Row Level Security) |
| Forms/validation | React Hook Form + Zod |
| Language | TypeScript |

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (free tier is fine)

### Setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase project's URL and keys (found in Supabase → Project Settings → API):

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Leave `USE_MOCK_HUBSPOT=true` — live HubSpot sync isn't wired up yet, so the app runs on seeded Supabase data either way.

Apply the database schema:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Before seeding, create three Supabase Auth users — one per role — via the Supabase dashboard (Authentication → Users) or the Auth admin API. The seed script looks them up by email, so use exactly these:

```
admin@metrichub.com
manager@metrichub.com
rep@metrichub.com
```

Then seed realistic demo data (tenant, teams, deals, tickets, activities — including a handful of deliberately broken records so the Data Quality dashboard has something to catch):

```bash
node scripts/seed-demo-data.mjs
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # production build
npm run start   # run the production build locally
npm run lint    # ESLint
```

## Project structure

```
src/
  app/
    (auth)/         # login, signup
    (dashboard)/    # Executive, Pipeline, Service SLA, Data Quality
  components/
    dashboard/      # charts, KPI cards, drill-through panel, nav
    auth/           # role selector, typing animation
    ui/             # shared primitives (Button, Input, ThemeToggle)
  lib/
    queries/        # Supabase query layer, one function per data need
    supabase/       # client/server Supabase helpers
    drill-through.ts
supabase/
  migrations/       # schema, RLS policies, dashboard views
scripts/
  seed-demo-data.mjs
```

## How the data works

Every dashboard reads from real Postgres views over seeded tables (`raw_deals`, `raw_tickets`, `fact_stage_transition`, `fact_ticket_sla`, and friends) — not static mock files. Row Level Security policies enforce the same Admin/Manager/Rep scoping at the database layer that the UI reflects, so what you see is what the database actually allows that role to query, all the way down.

## Deploying

This is a standard Next.js app — deploys cleanly to [Vercel](https://vercel.com). Set the same environment variables from `.env.local` in your Vercel project settings, connect your Supabase project, and push.

## Status

This is an active work-in-progress demo build. A couple of widgets are intentionally cosmetic for now (AI Insights, Quota Attainment) pending real data sources — see `docs/` (untracked, local-only) for the full roadmap and design notes.
