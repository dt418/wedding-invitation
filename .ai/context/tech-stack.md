# Tech Stack Reference

## Frontend Stack

### Framework & Runtime
- **Next.js 16.2.6** - App Router, Turbopack bundler
- **React 19.2.4** - Concurrent features enabled
- **TypeScript 5** - Strict mode enabled

### Styling
- **Tailwind CSS v4** - No tailwind.config.js; config via CSS @theme
- **shadcn/ui + Base UI** - Component library (button, card, badge, etc.)
- **class-variance-authority** - Variant composition
- **Design tokens** - CSS custom properties for theming

### Key Libraries
- **lucide-react** - Icon library (only icons source)
- **nanoid** - Invite code generation
- **qrcode** - QR code generation
- **zod** - Schema validation (v4)
- **jsonwebtoken** - JWT handling
- **bcryptjs** - Password hashing
- **papaparse** - CSV parsing for guest import
- **dompurify** - HTML sanitization
- **drizzle-zod** - Drizzle-Zod integration
- **sonner** - Toast notifications

### Project Structure
```
src/
├── app/                    # App Router pages
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   ├── invite/            # Public invite pages
│   ├── globals.css        # Global styles + Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── builder/           # Event builder components
│   ├── templates/         # Template gallery
│   ├── ui/                # Primitives (button, card, badge, icons)
│   └── invite-renderer.tsx
├── db/
│   ├── index.ts           # Drizzle client
│   ├── schema.ts          # Schema definitions
│   └── seed.ts            # Demo data
└── lib/
    ├── auth.ts            # JWT utilities
    ├── validators.ts      # Zod schemas
    ├── invite-code.ts     # Code generation
    ├── qr.ts             # QR generation
    ├── utils.ts          # Utilities (cn)
    └── useInView.ts      # Scroll animation hook
```

## Backend Stack

### Database
- **PostgreSQL** - Primary database
- **Drizzle ORM** - Type-safe query builder
- **postgres-js** - Driver (NOT `pg` or `neon`)
- **Docker** - Local development via `docker-compose.yml`

### Auth Driver
```typescript
// src/db/index.ts - ACTUAL PATTERN
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });
```

### Authentication
- **JWT** - Token-based auth via cookies
- **bcrypt** - Password hashing
- **Cookie-based sessions** - wedding_token cookie

### API Pattern
```typescript
// API routes in src/app/api/
// Pattern: Next.js Route Handlers
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // ...
}
```

## Dev Commands

```bash
pnpm dev        # Start dev server (Turbopack)
pnpm build      # Production build
pnpm lint       # ESLint
pnpm typecheck  # TypeScript check
pnpm db:seed    # Seed demo data
pnpm db:migrate # Run migrations
pnpm db:generate # Generate migrations
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| DATABASE_URL | Neon PostgreSQL connection string |
| JWT_SECRET | Secret for JWT signing (min 32 chars) |
| NODE_ENV | development / production |

## Key Patterns

### Import Aliases
```typescript
import { db } from "@/db/index";
import { verifyToken } from "@/lib/auth";
```

### Type-Safe Imports
```typescript
import type { SomeType } from "zod"; // Type-only
import { z } from "zod"; // Runtime
```

### Server Components
- Use React Server Components by default
- Add `'use client'` only when interactivity needed
- Data fetching in Server Components, not client

### Database Client
```typescript
import { db } from "@/db/index";
// Drizzle client instance
```

## CSS Token System

Tokens defined in `src/app/globals.css`:
```css
:root {
  --background: #FFF8F0;
  --foreground: #1A1A1A;
  --color-primary: #E11D48;
  --color-primary-foreground: #ffffff;
  --color-secondary: #FDE047;
  --color-secondary-foreground: #1A1A1A;
  --color-muted: #FDF4FF;
  --color-muted-foreground: #831843;
  --color-border: #FBCFE8;
  --color-destructive: #DC2626;
  --radius: 0.625rem;
}
```

Usage in components:
```typescript
// Via Tailwind utilities
className="bg-primary text-primary-foreground"

// Via CSS variables
style={{ backgroundColor: 'var(--background)' }}
```

## shadcn/ui Components

Installed via shadcn CLI:
- `button` - Action buttons with variants
- `card` - Content containers
- `badge` - Status indicators