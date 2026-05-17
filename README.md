# Wedding Invitation Platform

Next.js 16 wedding invitation SaaS with public invite pages, RSVP tracking, template system, and authenticated dashboard.

## Tech Stack

- Next.js 16.2.6 (App Router, Turbopack)
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL (`postgres` driver)
- Zod v4
- JWT auth (`wedding_token` cookie)
- pnpm

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local Postgres via `docker compose`)

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Start local database

```bash
docker compose up -d
```

3. Configure environment

```bash
cp .env.example .env.local
```

Required vars in `.env.local`:

```bash
DATABASE_URL=postgresql://wedding:wedding123@localhost:5432/wedding_invitation
JWT_SECRET=replace-with-32-char-secret
NODE_ENV=development
```

4. Run migrations + seed

```bash
pnpm db:migrate
pnpm db:seed
```

5. Start app

```bash
pnpm dev
```

Open http://localhost:3000

## Default Demo Account

- Email: `demo@wedding.local`
- Password: `Aa@123456#`

## Core Commands

```bash
pnpm dev          # run dev server
pnpm build        # production build
pnpm lint         # eslint
pnpm db:generate  # generate drizzle migration
pnpm db:migrate   # apply migrations
pnpm db:seed      # seed demo data
```

## App Surfaces

- Public invite page: `/invite/[code]`
- Auth pages: `/login`, `/register`
- Dashboard pages: `/events`, `/events/[id]`, `/events/[id]/edit`, `/events/[id]/analytics`
- Templates gallery: `/templates`

## Docs

Project planning/design docs live in:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`

See `docs/superpowers/README.md` for doc index.
