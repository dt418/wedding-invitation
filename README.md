# Wedding Invitation Platform

A cinematic, luxury wedding invitation SaaS — editorial design meets schema-driven content architecture. Create stunning, customizable wedding invitations with unlimited template variation through a single invariant rendering engine.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.6 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19.2.4, Tailwind CSS v4 |
| Database | PostgreSQL via Drizzle ORM + `postgres` driver |
| Auth | JWT cookie auth (`wedding_token`) |
| Validation | Zod v4 |
| Package Manager | pnpm |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start PostgreSQL (via Docker)
docker compose up -d

# Configure environment
cp .env.example .env.local
# Edit .env.local: set DATABASE_URL and JWT_SECRET

# Run migrations and seed demo data
pnpm db:migrate
pnpm db:seed

# Start development server
pnpm dev
```

**Demo account:** `demo@wedding.local` / `Aa@123456#`

## Core Routes

| Route | Description |
|-------|-------------|
| `/invite/[code]` | Public invite page (no auth required) |
| `/login`, `/register` | Authentication |
| `/events` | Dashboard — list all events |
| `/events/[id]` | Event detail |
| `/events/[id]/edit` | Section editor & preview |
| `/events/[id]/guests` | Guest management |
| `/events/[id]/invites` | Invite generation & delivery |
| `/events/[id]/analytics` | Page view & open tracking |

## Core Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm test         # Vitest (dev watch)
pnpm test:run     # Vitest (single run)
pnpm db:generate  # Generate Drizzle migration from schema changes
pnpm db:migrate   # Apply migrations
pnpm db:seed      # Seed demo user and template data
```

## Architecture Principle

```
Invitation Engine + Theme System + JSON Schema Content + Dynamic Section Renderer = Unlimited Templates
```

Templates are not hardcoded pages. The platform separates:
- **Template content** — defined as JSONB section schemas, not HTML
- **Visual theme** — defined as color token sets, not inline styles
- **Rendering logic** — a single invariant engine maps section types to components

This design enables infinite template variation from a fixed code surface. See [ARCHITECTURE.md](./ARCHITECTURE.md) and [THEME_SYSTEM.md](./THEME_SYSTEM.md) for details.