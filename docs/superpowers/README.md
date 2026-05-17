# Wedding Invitation Platform — Project Documentation

> Architecture decisions, design specs, and implementation plans for this project.

## Docs Structure

```
docs/superpowers/
├── README.md              # This file — overview + index
├── specs/                 # Design specifications (approved)
│   ├── 2026-05-16-wedding-saas-design.md
│   ├── 2026-05-17-content-site-design-system.md
│   ├── 2026-05-17-templates-modal-design.md
│   └── 2026-05-17-wedding-redesign-design.md
└── plans/                 # Implementation plans (in execution)
    ├── 2026-05-16-wedding-saas-mvp.md
    ├── 2026-05-16-wedding-saas-mvp-migrations.md
    ├── 2026-05-17-templates-modal-implementation.md
    └── 2026-05-17-wedding-landing-redesign.md
```

## Quick Links

### Specs (Design Decisions)
| File | Topic | Status |
|------|-------|--------|
| `specs/2026-05-16-wedding-saas-design.md` | Overall SaaS architecture | Reference |
| `specs/2026-05-17-content-site-design-system.md` | Design tokens, fonts, palette | Reference |
| `specs/2026-05-17-wedding-redesign-design.md` | Landing page redesign | Implemented |
| `specs/2026-05-17-templates-modal-design.md` | Templates gallery modal + demo route | Implemented |

### Plans (Implementation)
| File | Topic | Status |
|------|-------|--------|
| `plans/2026-05-16-wedding-saas-mvp.md` | MVP features + DB schema | Implemented |
| `plans/2026-05-16-wedding-saas-mvp-migrations.md` | Drizzle migrations | Applied |
| `plans/2026-05-17-wedding-landing-redesign.md` | Landing page rebuild | Implemented |
| `plans/2026-05-17-templates-modal-implementation.md` | Template modal + demo route | Implemented |

## Current Implementation Status

### Done
- Landing page (`src/app/page.tsx`) — fully English, English anchors
- Templates gallery (`src/app/(dashboard)/templates/page.tsx`) — modal on click
- Template modal (`src/components/templates/template-action-modal.tsx`)
- Public demo route (`src/app/invite/[slug]/demo/page.tsx`)
- Auth via `src/proxy.ts` (JWT cookie `wedding_token`, 7d expiry)
- DB schema with Drizzle ORM + Neon Postgres

### In Progress
- Documentation consolidation (this folder)

## Tech Stack

- **Framework**: Next.js 16.2.6 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 (CSS-based config)
- **Database**: Neon Postgres (Drizzle ORM, `postgres` driver)
- **Auth**: JWT via cookie `wedding_token`
- **Package Manager**: pnpm
- **Fonts**: `--font-jakarta` (body), `--font-cormorant` (headings), `--font-great-vibes` (accent)

## Key Route Map

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Public | Landing page |
| `/login`, `/register` | Public | Auth pages |
| `/events` | Required | Dashboard home |
| `/events/[id]` | Required | Event detail |
| `/events/[id]/edit` | Required | Event editor |
| `/invite/[code]` | Public | Guest RSVP view |
| `/invite/[slug]/demo` | Public | Template preview |
| `/templates` | Required | Template gallery |

## Demo Account

- **Email**: `demo@wedding.local`
- **Password**: `Aa@123456#`