<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: Wedding Invitation Platform

## Tech Stack

- **Next.js 16.2.6** (App Router, Turbopack) — `next dev` uses Turbopack
- **React 19.2.4** — mind breaking changes vs React 18
- **Tailwind CSS v4** — no `tailwind.config.js`; config via CSS `@theme` or postcss
- **shadcn/ui** — component library (Base UI), installed via `npx shadcn@latest add`
- **Drizzle ORM** with `drizzle-orm` + `postgres` (pg driver, NOT mysql2)
- **Neon Postgres** (serverless, `postgres` package) — `DATABASE_URL` env var
- **pnpm** — not npm/yarn/bun
- **TypeScript 5**
- **Zod v4** — `import { z } from "zod/v4"` or just `"zod"` (note version differences)
- **JWT auth** — cookie name `wedding_token`, sign via `src/lib/auth.ts`
- **sonner** — toast notifications

## Dev Commands

```bash
pnpm dev        # start dev server (uses Turbopack)
pnpm build      # production build
pnpm lint       # eslint
pnpm db:seed   # seed demo user + templates
pnpm db:migrate # run Drizzle migrations
pnpm db:generate # generate migration from schema changes
```

## Database Setup

```bash
# Start postgres via docker-compose
docker compose up -d

# DATABASE_URL format:
# postgresql://wedding:wedding123@localhost:5432/wedding_invitation
```

Default postgres credentials from `docker-compose.yml`:
- user: `wedding`, pass: `wedding123`, db: `wedding_invitation`

## Auth & Routing

- Auth cookie: `wedding_token` (JWT, 7d expiry)
- Middleware proxy at `src/proxy.ts` — redirects unauthenticated users to `/login`
- Public routes (no auth required): `/invite/*`, `/login`, `/register`
- Authenticated redirect from `/login|register` → `/events`

## Route Structure

- `(auth)/login|register` — auth pages
- `(dashboard)/events|events/[id]|events/[id]/edit|events/[id]/analytics` — authenticated app
- `/invite/[code]` — public invite pages (RSVP, open tracking)

## Database Schema (`src/db/schema.ts`)

Tables: `users`, `events`, `templates`, `templateVariants`, `sections`, `templateSections`, `guests`, `invites`, `rsvps`, `userSubscriptions`, `analyticsEvents`

Key indexes already defined — don't add redundant ones.

## Drizzle Migrations

1. Edit `src/db/schema.ts`
2. Run `pnpm db:generate` to generate migration in `./drizzle/`
3. Run `pnpm db:migrate` to apply

## Demo User

- Email: `demo@wedding.local`
- Password: `Aa@123456#`
- Created by `pnpm db:seed`

## Key Imports

```typescript
import { db } from "@/db/index";
import { verifyToken, signToken } from "@/lib/auth";
```

## Env Vars

Required in `.env.local`:
- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — min 32 chars, used for JWT signing
- `NODE_ENV` — development | production

## Code Conventions

- Use `import type` for type-only imports to reduce bundle size
- Auth check inside each route/action — don't rely solely on middleware
- Prefer `React.cache()` for server-side DB call deduplication within a request

## Git Commit Rules

- **ALWAYS write detailed commit messages with body description** - never commit with just a short subject line
- Commit message format:
  ```
  <type>: <short summary> (max 72 chars)

  Detailed description explaining WHY this change was made.
  What problem does it solve? What was the motivation?

  - Bullet points for multiple changes
  - Include relevant file paths or component names
  - Mention related issues or features if applicable
  ```
- Good commit examples:
  - `fix: improve Dialog overlay with darker backdrop and blur effect`

    Added backdrop-blur-sm and bg-black/50 for better visual separation from background. Previous bg-black/10 was too subtle and made the dialog feel disconnected.
    
    - src/components/ui/dialog.tsx: updated DialogOverlay and DialogContent classes
  - `feat: add delete confirmation dialog with i18n labels for event cards`

    Users requested a way to safely delete events without accidental deletion. Added confirmation dialog with warning message and i18n support for all 5 locales.
    
    - src/components/events/event-list-client.tsx: new component
    - src/lib/i18n.ts: added view, edit, delete, confirmDelete labels
- Bad commit examples (too vague or missing description):
  - `fix: update dialog`
  - `fix: bug`
  - `wip`
  - `feat: add feature` (no explanation of what/why)
- **Minimum requirement**: Subject line + at least 2 sentences of body description
- Never commit with `--allow-empty-message` or skip description

## Figma-to-Code Design System Rules

### Scope
- Applies to all UI work in: `src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/lib/**/*.ts`

### Required Figma Workflow
1. Get design context for exact node(s) via Figma MCP.
2. Get screenshot for visual parity reference.
3. Implement using existing project primitives first.
4. Compare result against screenshot before marking done.
5. Validate: `pnpm lint && pnpm build`.

### Component Reuse Rules
- **IMPORTANT**: Reuse primitives from `src/components/ui/` before creating new. Do not duplicate button/card/badge/section-wrapper.
- New shared UI components → `src/components/ui/`. Feature-local pieces stay in page/feature file only if not reusable.

### Styling & Token Rules
- **IMPORTANT**: Use tokens from `src/app/globals.css`; do not hardcode random hex colors.
- Font system: `--font-jakarta` (body), `--font-cormorant` (headings), `--font-great-vibes` (accent).
- Romantic palette from `:root` token set — baseline, don't change.
- Use Tailwind v4 utilities + token vars. Inline styles only if dynamic/required.
- Preserve `@media (prefers-reduced-motion: reduce)` behavior for every new animation.

### Motion Rules
- 150–300ms micro-interactions.
- Transform/opacity-only animations (no layout-jank).
- Scroll reveal: use `useInView` + `AnimatedSection` pattern.
- Hover lift allowed (cards: `translateY`, subtle shadow change only).
- Add motion-reduce fallback for every new animation.

### Icon & Asset Rules
- **IMPORTANT**: Lucide icons only via `src/components/ui/icons.tsx`. No emoji as structural icons.
- **IMPORTANT**: Do not add new icon library unless explicitly requested.
- Downloaded Figma assets → appropriate `public/` subdirectory.

### Landing Structure Consistency
- Section anchor IDs: `#templates`, `#how-it-works`, `#features`, `#pricing`.
- Hero phone-mockup semantic classes when editing: `hero-visual`, `phone-frame`, `phone-screen`, `phone-notch`, `thiep-preview`, `phone-info`, `floating-card`, `fc-*`.
- "How it works" active step must stay synced with right-side visual state.

### Accessibility Rules
- Visible focus states on all interactive elements.
- WCAG AA minimum contrast (4.5:1).
- Do not convey status by color alone.
- Keyboard navigation for links/buttons/`<details>`.

### Quality Gate
- Before marking complete: `pnpm lint` + `pnpm build` must both pass.
- New components: use existing `cn()` from `src/lib/utils.ts` for class composition.