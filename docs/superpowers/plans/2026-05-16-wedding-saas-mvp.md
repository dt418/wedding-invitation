# Wedding SaaS MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MVP wedding invitation SaaS — auth, events, template builder, guest import, invite pages, RSVP, analytics.

**Architecture:** Next.js 16 App Router + PostgreSQL + Drizzle ORM + Zod validation. Three surfaces: public invite page, private dashboard, agency surface. Template runtime loads event → template+variant → ordered sections → overrides → render.

**Tech Stack:** Next.js 16, Drizzle ORM, Drizzle Kit, pg, Zod, Tailwind CSS v4, QR code generation.

**Migration Policy:** Follow `docs/superpowers/plans/2026-05-16-wedding-saas-mvp-migrations.md` for all schema/data migration rules.

---

## File Structure Overview

```
src/
  db/
    schema.ts          ← existing (377 lines, 11 tables)
    index.ts           ← new: drizzle client export
    migrate.ts         ← new: migration runner
    seed.ts            ← new: seed templates + demo data
  lib/
    db.ts              ← new: db client singleton
    auth.ts            ← new: password hashing + JWT helpers
    validators.ts      ← new: Zod schemas for API payloads
    invite-code.ts     ← new: unique invite code generator
    qr.ts              ← new: QR code URL generator
  app/
    (auth)/
      register/page.tsx    ← new
      login/page.tsx       ← new
      actions.ts           ← new: server actions for auth
    (dashboard)/
      layout.tsx           ← new: dashboard shell
      events/
        page.tsx           ← new: event list
        new/page.tsx       ← new: create event
        [id]/
          page.tsx         ← new: event detail
          edit/page.tsx    ← new: template builder
          guests/page.tsx  ← new: guest list + import
          invites/page.tsx ← new: invite management
          analytics/page.tsx ← new
      templates/
        page.tsx           ← new: template gallery
    api/
      auth/[...nextauth]/route.ts ← new: auth handler
      events/route.ts      ← new: GET/POST /api/events
      events/[id]/route.ts ← new: GET/PATCH/DELETE
      events/[id]/guests/import/route.ts ← new
      invites/[code]/route.ts ← new: public invite resolve
      invites/[code]/rsvp/route.ts ← new: RSVP submit
      events/[id]/analytics/route.ts ← new
    invite/
      [code]/page.tsx      ← new: public invite page
    layout.tsx             ← existing (update)
    page.tsx               ← existing (replace with landing)
  components/
    ui/                     ← new: base UI primitives
    invite-renderer.tsx     ← new: template runtime renderer
    builder/
      preview.tsx          ← new: live preview panel
      section-editor.tsx    ← new
      property-panel.tsx    ← new
    rsvp-form.tsx          ← new: guest RSVP form
    guest-import.tsx       ← new: CSV/XLSX upload
```

---

## Task 0: Project Config & Dependencies

**Goal:** Add missing deps, configure drizzle, verify build.

**Files:**
- Modify: `package.json` — add deps
- Create: `drizzle.config.ts` — drizzle kit config
- Create: `.env.local` — env template
- Create: `.env.example` — gitignore-safe example

- [ ] **Step 1: Add dependencies**

```bash
pnpm add @neondatabase/serverless drizzle-zod zod bcryptjs jsonwebtoken papaparse qrcode
pnpm add -D @types/bcryptjs @types/jsonwebtoken @types/papaparse @types/qrcode
```

**package.json additions:**
```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.9.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "papaparse": "^5.4.1",
    "qrcode": "^1.5.4",
    "zod": "^3.23.0",
    "drizzle-zod": "^0.5.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/papaparse": "^5.3.14",
    "@types/qrcode": "^1.5.5"
  }
}
```

Run: `pnpm install`

- [ ] **Step 2: Create drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 3: Create .env.example**

```bash
DATABASE_URL=postgresql://user:password@host:5432/wedding_db
JWT_SECRET=your-secret-key-min-32-chars
NODE_ENV=development
```

- [ ] **Step 4: Verify build**

Run: `pnpm run build`
Expected: Clean build (ignore DB connection error — no DB yet)

---

## Task 1: Database Setup

**Goal:** Create drizzle config, generate initial migration, create seed script.

**Files:**
- Create: `src/db/index.ts` — db client
- Create: `src/db/seed.ts` — seed data
- Create: `drizzle.config.ts` (if not done in Task 0)

**Prerequisite:** `.env.local` with `DATABASE_URL` pointing to live postgres.

- [ ] **Step 1: Create src/db/index.ts**

```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes
const queryClient = postgres(connectionString, { max: 1 });
export const db = drizzle(queryClient, { schema });

// For migrations (separate to avoid pooling issues)
export const migrationClient = postgres(connectionString, { max: 1 });
```

- [ ] **Step 2: Generate initial migration**

Run: `npx drizzle-kit generate`
Expected: Creates `drizzle/` folder with migration files

- [ ] **Step 3: Apply migration**

Run: `npx drizzle-kit migrate`
Expected: All 11 tables created in postgres

- [ ] **Step 4: Create seed script at src/db/seed.ts**

```typescript
import { db } from "./index";
import {
  templates,
  templateVariants,
  sections,
} from "./schema";

const seedTemplates = [
  {
    name: "Song Long",
    slug: "song-long",
    category: "truyen_thong" as const,
    description: "Traditional dragon-phoenix wedding invitation",
    tags: ["traditional", "dragon", "red", "gold"],
    metadata: {
      heroImage: "/templates/song-long/hero.jpg",
      style: "traditional-vietnamese",
      fontPair: ["Playfair Display", "Noto Serif"],
    },
  },
  {
    name: "Vườn Xuân",
    slug: "vuon-xuan",
    category: "thien_nhien" as const,
    description: "Floral garden wedding invitation",
    tags: ["nature", "floral", "spring", "green"],
    metadata: {
      heroImage: "/templates/vuon-xuan/hero.jpg",
      style: "floral-nature",
      fontPair: ["Cormorant Garamond", "Lato"],
    },
  },
  {
    name: "Minimal Touch",
    slug: "minimal-touch",
    category: "toi_gian" as const,
    description: "Clean minimal wedding invitation",
    tags: ["minimal", "clean", "modern", "white"],
    metadata: {
      heroImage: "/templates/minimal-touch/hero.jpg",
      style: "minimal-modern",
      fontPair: ["Inter", "Inter"],
    },
  },
];

export async function seed() {
  console.log("Seeding templates...");

  for (const tmpl of seedTemplates) {
    const [inserted] = await db
      .insert(templates)
      .values(tmpl)
      .returning();

    // Default variant per template
    await db.insert(templateVariants).values({
      templateId: inserted.id,
      variantName: "Classic",
      colorTokens: {
        primary: "#C41E3A",
        secondary: "#FFD700",
        accent: "#8B0000",
        background: "#FFF8F0",
        text: "#1A1A1A",
      },
      isDefault: true,
    });

    // Default sections per template
    const defaultSections = [
      { sectionType: "hero", order: 0, isRequired: true },
      { sectionType: "couple-names", order: 1, isRequired: true },
      { sectionType: "event-info", order: 2, isRequired: true },
      { sectionType: "venue", order: 3, isRequired: true },
      { sectionType: "timeline", order: 4, isRequired: false },
      { sectionType: "gallery", order: 5, isRequired: false },
      { sectionType: "rsvp", order: 6, isRequired: true },
    ];

    for (const sec of defaultSections) {
      await db.insert(sections).values({
        templateId: inserted.id,
        sectionType: sec.sectionType,
        order: sec.order,
        isRequired: sec.isRequired,
        isEditable: true,
        contentSchema: {
          type: "object",
          properties: {},
        },
        defaultContent: {},
        animations: { entrance: "fade", duration: 600 },
      });
    }

    console.log(`Seeded: ${tmpl.name}`);
  }

  console.log("Seed complete.");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 5: Run seed**

Run: `npx tsx src/db/seed.ts`
Expected: 3 templates with variants and sections inserted

- [ ] **Step 6: Add seed script to package.json**

```json
"scripts": {
  "db:seed": "npx tsx src/db/seed.ts",
  "db:migrate": "npx drizzle-kit migrate",
  "db:generate": "npx drizzle-kit generate"
}
```

- [ ] **Step 7: Commit**

```bash
git add package.json drizzle.config.ts .env.example src/db/index.ts src/db/seed.ts drizzle/
git commit -m "feat: project config, drizzle setup, seed data"
```

---

## Task 2: Auth (Register + Login)

**Goal:** User registration and login with JWT sessions.

**Files:**
- Create: `src/lib/auth.ts` — password hashing + JWT helpers
- Create: `src/lib/validators.ts` — Zod schemas
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/actions.ts` — server actions

- [ ] **Step 1: Create src/lib/auth.ts**

```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "agency" | "admin";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/wedding_token=([^;]+)/);
  return match ? match[1] : null;
}
```

- [ ] **Step 2: Create src/lib/validators.ts**

```typescript
import { z } from "zod";
import { events, guests, invites, rsvps } from "@/db/schema";

// Auth validators
export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 chars"),
  name: z.string().min(1, "Name is required").max(255),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// Event validators
export const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  templateId: z.string().uuid("Invalid template ID"),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  mapUrl: z.string().url().optional(),
  description: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Guest row validator (for import)
export const guestImportRowSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  relation: z.enum(["groom_side", "bride_side", "friend", "family"]).optional(),
  tableNumber: z.number().int().positive().optional(),
  seatCount: z.number().int().min(1).default(1).optional(),
  groupName: z.string().max(255).optional(),
  notes: z.string().optional(),
});

// RSVP validator
export const rsvpSubmitSchema = z.object({
  attendance: z.enum(["attending", "not_attending", "maybe"]),
  plusOnes: z.number().int().min(0).default(0),
  plusOneNames: z.string().max(500).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});
```

- [ ] **Step 3: Create src/app/(auth)/actions.ts**

```typescript
"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password, name } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    return { error: "Email already registered" };
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, name, role: "user" })
    .returning();

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  cookies().set("wedding_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/dashboard/events");
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const { verifyPassword } = await import("@/lib/auth");
  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return { error: "Invalid email or password" };
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  cookies().set("wedding_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/dashboard/events");
}

export async function logoutAction() {
  cookies().delete("wedding_token");
  redirect("/login");
}
```

- [ ] **Step 4: Create src/app/(auth)/register/page.tsx**

```typescript
import { registerAction } from "../actions";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-semibold mb-6">Create Account</h1>
        <form action={registerAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/login" className="text-rose-600 font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/app/(auth)/login/page.tsx**

```typescript
import { loginAction } from "../actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-semibold mb-6">Welcome Back</h1>
        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          No account yet?{" "}
          <a href="/register" className="text-rose-600 font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/validators.ts src/app/\(auth\)/ src/app/actions.ts
git commit -m "feat: auth system — register, login, JWT sessions"
```

---

## Task 3: Dashboard Shell + Event List

**Goal:** Dashboard layout with event list page.

**Files:**
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/app/(dashboard)/events/page.tsx`
- Create: `src/middleware.ts` — auth guard

- [ ] **Step 1: Create src/middleware.ts**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("wedding_token")?.value;

  const isAuthRoute = ["/login", "/register"].some((r) =>
    request.nextUrl.pathname.startsWith(r)
  );
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isPublicRoute = request.nextUrl.pathname.startsWith("/invite");

  if (!token && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard/events", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Create src/app/(dashboard)/layout.tsx**

```typescript
import { logoutAction } from "@/app/(auth)/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-50 bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <a href="/dashboard/events" className="text-xl font-semibold">
              Wedding Invite
            </a>
            <nav className="flex gap-6 text-sm">
              <a
                href="/dashboard/events"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Events
              </a>
              <a
                href="/dashboard/templates"
                className="text-zinc-600 hover:text-zinc-900"
              >
                Templates
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/dashboard/settings"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Settings
            </a>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-zinc-700"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create src/app/(dashboard)/events/page.tsx**

```typescript
import { cookies } from "next/headers";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function EventsPage() {
  const token = cookies().get("wedding_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token!);
  if (!payload) return null;

  const userEvents = await db.query.events.findMany({
    where: eq(events.userId, payload.userId),
    orderBy: [desc(events.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">My Events</h1>
          <p className="text-zinc-500 mt-1">
            {userEvents.length} event{userEvents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors"
        >
          Create Event
        </Link>
      </div>

      {userEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border">
          <p className="text-zinc-500 mb-4">No events yet</p>
          <Link
            href="/dashboard/events/new"
            className="text-rose-600 font-medium hover:underline"
          >
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userEvents.map((event) => (
            <Link
              key={event.id}
              href={`/dashboard/events/${event.id}`}
              className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow"
            >
              {event.thumbnailUrl && (
                <div className="aspect-video bg-zinc-100 rounded-lg mb-4 overflow-hidden">
                  <img
                    src={event.thumbnailUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h2 className="font-semibold text-lg mb-1">{event.title}</h2>
              <p className="text-sm text-zinc-500">
                {new Date(event.eventDate).toLocaleDateString("vi-VN")}
              </p>
              <span
                className={`inline-block mt-3 text-xs px-2 py-1 rounded-full ${
                  event.status === "published"
                    ? "bg-green-100 text-green-700"
                    : event.status === "draft"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {event.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/app/\(dashboard\)/
git commit -m "feat: dashboard shell + event list page"
```

---

## Task 4: Create Event + Template Gallery

**Goal:** Event creation form + template picker.

**Files:**
- Create: `src/app/(dashboard)/events/new/page.tsx`
- Create: `src/app/(dashboard)/templates/page.tsx`
- Create: `src/app/api/events/route.ts`
- Create: `src/app/api/templates/route.ts`

- [ ] **Step 1: Create src/app/api/events/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { createEventSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const all = await db.query.events.findMany({
    where: eq(events.userId, userId),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });

  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { title, slug, templateId, eventDate, eventTime, venueName, venueAddress, mapUrl, description } = parsed.data;

  // Check slug uniqueness per user
  const existing = await db.query.events.findFirst({
    where: and(eq(events.userId, userId), eq(events.slug, slug)),
  });

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken. Choose another." },
      { status: 409 }
    );
  }

  const [created] = await db
    .insert(events)
    .values({
      userId,
      title,
      slug,
      templateId,
      eventDate,
      eventTime,
      venueName,
      venueAddress,
      mapUrl,
      description,
      status: "draft",
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
```

- [ ] **Step 2: Create src/app/api/templates/route.ts**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { templates, templateVariants } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const all = await db.query.templates.findMany({
    where: eq(templates.isActive, true),
    with: {
      // variants via relation if defined, else manual query
    },
  });

  // Fetch variants for each template
  const withVariants = await Promise.all(
    all.map(async (t) => {
      const variants = await db.query.templateVariants.findMany({
        where: eq(templateVariants.templateId, t.id),
      });
      return { ...t, variants };
    })
  );

  return NextResponse.json(withVariants);
}
```

- [ ] **Step 3: Create src/app/(dashboard)/templates/page.tsx**

```typescript
import { db } from "@/db";
import { templates, templateVariants } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  truyen_thong: "Truyền thống",
  thien_nhien: "Thiên nhiên",
  hien_dai: "Hiện đại",
  lang_man: "Lãng mạn",
  co_phuc: "Cổ phục",
  sang_trong: "Sang trọng",
  toi_gian: "Tối giản",
  typography: "Typography",
  de_thuong: "Dễ thương",
};

export default async function TemplatesPage() {
  const all = await db.query.templates.findMany({
    where: eq(templates.isActive, true),
  });

  const withVariants = await Promise.all(
    all.map(async (t) => {
      const variants = await db.query.templateVariants.findMany({
        where: eq(templateVariants.templateId, t.id),
      });
      return { ...t, variants };
    })
  );

  const grouped = withVariants.reduce(
    (acc, tmpl) => {
      const cat = tmpl.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(tmpl);
      return acc;
    },
    {} as Record<string, typeof withVariants>
  );

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold mb-2">Template Gallery</h1>
      <p className="text-zinc-500 mb-8">Choose a template for your wedding invitation</p>

      {Object.entries(grouped).map(([cat, tmpls]) => (
        <div key={cat} className="mb-12">
          <h2 className="text-lg font-medium mb-4 text-zinc-700">
            {categoryLabels[cat] || cat}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tmpls.map((tmpl) => (
              <Link
                key={tmpl.id}
                href={`/dashboard/events/new?templateId=${tmpl.id}`}
                className="group"
              >
                <div className="aspect-[4/3] bg-zinc-100 rounded-xl overflow-hidden mb-3 border">
                  {tmpl.thumbnailUrl ? (
                    <img
                      src={tmpl.thumbnailUrl}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      {tmpl.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tmpl.name}</span>
                  {tmpl.isPremium && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{tmpl.description}</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create src/app/(dashboard)/events/new/page.tsx**

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function NewEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const body = {
      title: formData.get("title"),
      slug: formData.get("slug"),
      templateId: templateId || formData.get("templateId"),
      eventDate: formData.get("eventDate"),
      eventTime: formData.get("eventTime") || undefined,
      venueName: formData.get("venueName") || undefined,
      venueAddress: formData.get("venueAddress") || undefined,
      mapUrl: formData.get("mapUrl") || undefined,
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create event");
      setLoading(false);
      return;
    }

    const event = await res.json();
    router.push(`/dashboard/events/${event.id}/edit`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/templates"
          className="text-sm text-zinc-500 hover:text-zinc-700"
        >
          ← Back to templates
        </Link>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Create New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Event Title *</label>
          <input
            name="title"
            required
            placeholder="Hân & Minh Wedding"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            URL Slug * <span className="text-zinc-400 font-normal">(han-minh)</span>
          </label>
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            placeholder="han-minh"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Date *</label>
            <input
              name="eventDate"
              type="date"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              name="eventTime"
              type="time"
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Name</label>
          <input
            name="venueName"
            placeholder="Nhà hàng莲花"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Venue Address</label>
          <textarea
            name="venueAddress"
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(dashboard\)/events/new/page.tsx src/app/\(dashboard\)/templates/page.tsx src/app/api/events/route.ts src/app/api/templates/route.ts
git commit -m "feat: create event page + template gallery"
```

---

## Task 5: Event Detail + Builder

**Goal:** Event detail page with template builder (live split-pane preview).

**Files:**
- Create: `src/app/(dashboard)/events/[id]/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/edit/page.tsx`
- Create: `src/components/builder/preview.tsx`
- Create: `src/components/builder/section-list.tsx`
- Create: `src/components/invite-renderer.tsx`
- Create: `src/app/api/events/[id]/route.ts`

- [ ] **Step 1: Create src/app/api/events/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { updateEventSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const event = await db.query.events.findFirst({
    where: and(eq(events.id, id), eq(events.userId, userId)),
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(events)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(events).where(and(eq(events.id, id), eq(events.userId, userId)));
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create src/components/invite-renderer.tsx**

```typescript
"use client";

import { useState, useEffect } from "react";

interface SectionData {
  id: string;
  sectionType: string;
  customContent?: Record<string, unknown>;
  visibility: string;
}

interface RendererProps {
  sections: SectionData[];
  colorTokens?: Record<string, string>;
  previewMode?: "desktop" | "mobile";
}

// Section type → render function map
const sectionRenderers: Record<string, React.ComponentType<{
  content: Record<string, unknown>;
  colors: Record<string, string>;
}>> = {
  hero: ({ content, colors }) => (
    <section
      className="min-h-[60vh] flex items-center justify-center text-center px-8 py-20"
      style={{ backgroundColor: colors.background || "#FFF8F0" }}
    >
      <div>
        {content.coupleNames && (
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: colors.primary || "#C41E3A" }}
          >
            {content.coupleNames}
          </h1>
        )}
        {content.invitationText && (
          <p className="text-xl mt-4" style={{ color: colors.text || "#1A1A1A" }}>
            {content.invitationText}
          </p>
        )}
      </div>
    </section>
  ),

  "couple-names": ({ content, colors }) => (
    <section className="py-16 px-8 text-center">
      <h2
        className="text-4xl font-semibold"
        style={{ color: colors.primary }}
      >
        {content.names || "Name 1 & Name 2"}
      </h2>
    </section>
  ),

  "event-info": ({ content, colors }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto text-center">
        <p className="text-2xl font-medium" style={{ color: colors.text }}>
          {content.date || "Ngày XX tháng XX năm XXXX"}
        </p>
        {content.time && (
          <p className="text-lg mt-2" style={{ color: colors.text }}>
            {content.time}
          </p>
        )}
      </div>
    </section>
  ),

  venue: ({ content, colors }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto text-center">
        <h3 className="text-lg font-medium mb-2" style={{ color: colors.primary }}>
          Địa điểm
        </h3>
        <p className="text-xl font-semibold" style={{ color: colors.text }}>
          {content.venueName || "Tên nhà hàng"}
        </p>
        {content.address && (
          <p className="text-zinc-500 mt-1">{content.address}</p>
        )}
        {content.mapUrl && (
          <a
            href={content.mapUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-sm text-rose-600 hover:underline"
          >
            Xem bản đồ →
          </a>
        )}
      </div>
    </section>
  ),

  rsvp: ({ content, colors }) => (
    <section className="py-16 px-8 text-center">
      <h3 className="text-2xl font-semibold mb-4" style={{ color: colors.primary }}>
        Xác nhận tham dự
      </h3>
      <p className="text-zinc-500">Form RSVP sẽ hiển thị ở đây</p>
    </section>
  ),

  timeline: ({ content }) => (
    <section className="py-12 px-8">
      <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-6 text-center">Thời gian</h3>
        <div className="space-y-4">
          {(content.events as Array<{ time: string; label: string }> || []).map(
            (item, i) => (
              <div key={i} className="flex gap-4">
                <span className="font-medium text-rose-600">{item.time}</span>
                <span>{item.label}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  ),
};

export default function InviteRenderer({
  sections,
  colorTokens = {},
  previewMode = "desktop",
}: RendererProps) {
  const visibleSections = sections.filter((s) => s.visibility !== "hidden");

  const containerClass =
    previewMode === "mobile"
      ? "w-[375px] mx-auto border-x"
      : "w-full max-w-5xl mx-auto";

  return (
    <div className={containerClass}>
      {visibleSections.map((section) => {
        const Renderer = sectionRenderers[section.sectionType];
        if (!Renderer) return null;

        return (
          <div key={section.id}>
            <Renderer
              content={(section.customContent || {}) as Record<string, unknown>}
              colors={colorTokens}
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Create src/components/builder/preview.tsx**

```typescript
"use client";

import { useState } from "react";
import InviteRenderer from "@/components/invite-renderer";

interface PreviewProps {
  sections: Array<{
    id: string;
    sectionType: string;
    customContent?: Record<string, unknown>;
    visibility: string;
  }>;
  colorTokens?: Record<string, string>;
}

export default function BuilderPreview({ sections, colorTokens }: PreviewProps) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  return (
    <div className="h-full flex flex-col">
      {/* Preview controls */}
      <div className="flex items-center gap-2 p-3 border-b bg-white">
        <span className="text-sm text-zinc-500 mr-auto">Preview</span>
        <button
          onClick={() => setMode("desktop")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            mode === "desktop"
              ? "bg-rose-100 text-rose-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          Desktop
        </button>
        <button
          onClick={() => setMode("mobile")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            mode === "mobile"
              ? "bg-rose-100 text-rose-700"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          Mobile
        </button>
      </div>

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto bg-zinc-100 p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[600px]">
          <InviteRenderer
            sections={sections}
            colorTokens={colorTokens}
            previewMode={mode}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create src/app/(dashboard)/events/[id]/edit/page.tsx**

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import BuilderPreview from "@/components/builder/preview";

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Record<string, unknown> | null>(null);
  const [sections, setSections] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    const res = await fetch(`/api/events/${id}`);
    if (res.ok) {
      const data = await res.json();
      setEvent(data);
      // Load template sections from API
      const sectionsRes = await fetch(`/api/events/${id}/sections`);
      if (sectionsRes.ok) {
        setSections(await sectionsRes.json());
      }
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
    setLoading(false);
  }, [fetchEvent]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8">Event not found</div>;

  return (
    <div className="flex h-[calc(100vh-73px)] gap-0">
      {/* Left panel: section list */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold">{event.title as string}</h2>
          <p className="text-sm text-zinc-500 mt-1">Builder</p>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <h3 className="text-sm font-medium text-zinc-500 mb-3">SECTIONS</h3>
          <div className="space-y-2">
            {sections.map((sec) => (
              <div
                key={sec.id as string}
                className="px-3 py-2 rounded-lg border hover:border-rose-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {(sec.sectionType as string).replace("-", " ")}
                  </span>
                  <button
                    onClick={() => {
                      const updated = sections.map((s) =>
                        s.id === sec.id
                          ? { ...s, visibility: s.visibility === "hidden" ? "visible" : "hidden" }
                          : s
                      );
                      setSections(updated);
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-600"
                  >
                    {sec.visibility === "hidden" ? "Show" : "Hide"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: live preview */}
      <div className="flex-1 flex flex-col">
        <BuilderPreview
          sections={sections as Parameters<typeof BuilderPreview>[0]["sections"]}
          colorTokens={{}}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create src/app/api/events/[id]/sections/route.ts** (stub for section loading)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sections, templateSections } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  // Get template sections + event overrides
  const all = await db.query.sections.findMany();
  const overrides = await db.query.templateSections.findMany({
    where: eq(templateSections.eventId, eventId),
  });

  const overrideMap = new Map(overrides.map((o) => [o.sectionType, o]));

  const result = all.map((s) => {
    const ov = overrideMap.get(s.sectionType);
    return {
      id: ov?.id || s.id,
      sectionType: s.sectionType,
      customContent: ov?.customContent || s.defaultContent,
      customTheme: ov?.customTheme,
      visibility: ov?.visibility || "visible",
      order: s.order,
      isRequired: s.isRequired,
    };
  }).sort((a, b) => (a.order as number) - (b.order as number));

  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;
  const body = await req.json();

  // Upsert section override
  const { sectionType, customContent, customTheme, visibility } = body;

  const existing = await db.query.templateSections.findFirst({
    where: and(
      eq(templateSections.eventId, eventId),
      eq(templateSections.sectionType, sectionType)
    ),
  });

  if (existing) {
    await db
      .update(templateSections)
      .set({ customContent, customTheme, visibility, updatedAt: new Date() })
      .where(eq(templateSections.id, existing.id));
  } else {
    await db.insert(templateSections).values({
      eventId,
      sectionType,
      customContent,
      customTheme,
      visibility,
    });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/events/ src/components/invite-renderer.tsx src/components/builder/ src/app/\(dashboard\)/events/\[id\]/
git commit -m "feat: event builder with live preview"
```

---

## Task 6: Guest Import (CSV/XLSX)

**Goal:** Upload guest list, parse, validate, partial success return.

**Files:**
- Create: `src/app/(dashboard)/events/[id]/guests/page.tsx`
- Create: `src/app/api/events/[id]/guests/import/route.ts`
- Create: `src/lib/invite-code.ts`
- Create: `src/lib/qr.ts`
- Modify: `src/app/api/events/[id]/guests/import/route.ts` — import logic

- [ ] **Step 1: Create src/lib/invite-code.ts**

```typescript
import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet, 8);

export function generateInviteCode(): string {
  return nanoid();
}

export function generateInviteUrl(eventSlug: string, inviteCode: string): string {
  return `/invite/${inviteCode}`;
}
```

Install nanoid: `pnpm add nanoid`

- [ ] **Step 2: Create src/lib/qr.ts**

```typescript
import QRCode from "qrcode";

export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
```

- [ ] **Step 3: Create src/app/api/events/[id]/guests/import/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { guests, invites } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { guestImportRowSchema } from "@/lib/validators";
import { generateInviteCode, generateInviteUrl } from "@/lib/invite-code";
import { generateQrDataUrl } from "@/lib/qr";
import { eq, and } from "drizzle-orm";
import Papa from "papaparse";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  // Verify event ownership
  const eventRes = await fetch(
    new URL(`/api/events/${eventId}`, req.url),
    { headers: { cookie: req.headers.get("cookie") || "" } }
  );
  if (!eventRes.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse uploaded file
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json(
      { error: "Failed to parse CSV. Check format." },
      { status: 400 }
    );
  }

  type Row = Record<string, string>;
  const rows = parsed.data as Row[];

  const successRows: Array<{
    row: number;
    name: string;
    inviteCode: string;
    inviteUrl: string;
  }> = [];
  const failedRows: Array<{ row: number; name?: string; error: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed, header is row 1

    const parsedRow = guestImportRowSchema.safeParse({
      name: row.name || row.Name || row.Họ_tên,
      email: row.email || row.Email || row["E-mail"],
      phone: row.phone || row.Phone || row.Số_điện_thoại,
      relation: row.relation || row.Relation || row["Phía"],
      tableNumber: row.tableNumber
        ? parseInt(row.tableNumber, 10)
        : row.tableNumber === ""
          ? undefined
          : undefined,
      seatCount: row.seatCount
        ? parseInt(row.seatCount, 10)
        : undefined,
      groupName: row.groupName || row.groupName || row.Group,
      notes: row.notes || row.Notes || row.Ghi_chú,
    });

    if (!parsedRow.success) {
      failedRows.push({
        row: rowNum,
        name: row.name || row.Name,
        error: parsedRow.error.errors[0].message,
      });
      continue;
    }

    try {
      // Insert guest
      const [guest] = await db
        .insert(guests)
        .values({
          eventId,
          ...parsedRow.data,
        })
        .returning();

      // Generate invite
      const inviteCode = generateInviteCode();
      const inviteUrl = generateInviteUrl(eventRes.url, inviteCode);

      // Generate QR
      const qrCodeUrl = await generateQrDataUrl(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}${inviteUrl}`
      );

      await db.insert(invites).values({
        eventId,
        guestId: guest.id,
        inviteCode,
        inviteUrl,
        qrCodeUrl,
        status: "pending",
      });

      successRows.push({
        row: rowNum,
        name: parsedRow.data.name,
        inviteCode,
        inviteUrl,
      });
    } catch {
      failedRows.push({
        row: rowNum,
        name: parsedRow.data.name,
        error: "Database insert failed",
      });
    }
  }

  return NextResponse.json({
    total: rows.length,
    successCount: successRows.length,
    failedCount: failedRows.length,
    successRows,
    failedRows,
  });
}
```

- [ ] **Step 4: Create src/app/(dashboard)/events/[id]/guests/page.tsx**

```typescript
"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";

interface Result {
  total: number;
  successCount: number;
  failedCount: number;
  successRows: Array<{ row: number; name: string; inviteCode: string; inviteUrl: string }>;
  failedRows: Array<{ row: number; name?: string; error: string }>;
}

export default function GuestsPage() {
  const { id } = useParams<{ id: string }>();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/events/${id}/guests/import`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      setResult(await res.json());
    } else {
      const data = await res.json();
      alert(data.error || "Import failed");
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold mb-2">Import Guests</h1>
      <p className="text-zinc-500 mb-8">Upload CSV or XLSX file with guest list</p>

      <form onSubmit={handleImport} className="bg-white p-6 rounded-xl border mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Guest File (CSV)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx"
            required
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-rose-50 file:text-rose-700 file:font-medium hover:file:bg-rose-100"
          />
        </div>

        <div className="text-sm text-zinc-500 mb-4">
          <p className="font-medium mb-1">Expected columns:</p>
          <code className="text-xs bg-zinc-100 px-2 py-1 rounded">
            name, email, phone, relation, tableNumber, seatCount, groupName, notes
          </code>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {uploading ? "Importing..." : "Import Guests"}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
              <p className="text-sm text-green-600">Imported</p>
            </div>
            <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-red-700">{result.failedCount}</p>
              <p className="text-sm text-red-600">Failed</p>
            </div>
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
              <p className="text-2xl font-bold text-zinc-700">{result.total}</p>
              <p className="text-sm text-zinc-600">Total rows</p>
            </div>
          </div>

          {result.failedRows.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-medium mb-3">Failed Rows</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Row</th>
                      <th className="text-left py-2 px-3">Name</th>
                      <th className="text-left py-2 px-3">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.failedRows.map((r) => (
                      <tr key={r.row} className="border-b last:border-0">
                        <td className="py-2 px-3 text-zinc-500">{r.row}</td>
                        <td className="py-2 px-3">{r.name || "—"}</td>
                        <td className="py-2 px-3 text-red-600">{r.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/invite-code.ts src/lib/qr.ts src/app/api/events/\[id\]/guests/import/route.ts src/app/\(dashboard\)/events/\[id\]/guests/page.tsx
git commit -m "feat: guest import with CSV parse + partial success"
```

---

## Task 7: Public Invite Page + RSVP

**Goal:** Public invite page at `/invite/[code]`, RSVP form submission.

**Files:**
- Create: `src/app/invite/[code]/page.tsx`
- Create: `src/app/api/invites/[code]/route.ts`
- Create: `src/app/api/invites/[code]/rsvp/route.ts`
- Create: `src/components/rsvp-form.tsx`

- [ ] **Step 1: Create src/app/api/invites/[code]/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invites, events, guests, templates, templateVariants, sections, templateSections } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const invite = await db.query.invites.findFirst({
    where: eq(invites.inviteCode, code),
    with: { guest: true },
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const event = await db.query.events.findFirst({
    where: eq(events.id, invite.eventId),
    with: { template: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Get template sections + overrides
  const templateSectionsList = await db.query.sections.findMany({
    where: eq(sections.templateId, event.templateId),
  });

  const overrides = await db.query.templateSections.findMany({
    where: eq(templateSections.eventId, event.id),
  });

  const overrideMap = new Map(overrides.map((o) => [o.sectionType, o]));

  const sectionsWithOverrides = templateSectionsList.map((s) => {
    const ov = overrideMap.get(s.sectionType);
    return {
      id: ov?.id || s.id,
      sectionType: s.sectionType,
      customContent: ov?.customContent || s.defaultContent,
      customTheme: ov?.customTheme,
      visibility: ov?.visibility || "visible",
      order: s.order,
    };
  }).sort((a, b) => (a.order as number) - (b.order as number));

  // Get default variant
  const variants = await db.query.templateVariants.findMany({
    where: eq(templateVariants.templateId, event.templateId),
  });

  const defaultVariant = variants.find((v) => v.isDefault) || variants[0];

  // Track page view
  const { analyticsEvents } = await import("@/db/schema");
  await db.insert(analyticsEvents).values({
    eventId: event.id,
    visitorId: req.headers.get("x-visitor-id") || code,
    action: "page_view",
    metadata: { inviteId: invite.id },
  });

  // Update invite status to opened if not already
  if (invite.status === "sent" || invite.status === "pending") {
    await db
      .update(invites)
      .set({ status: "opened", openedAt: new Date() })
      .where(eq(invites.id, invite.id));
  }

  return NextResponse.json({
    invite: {
      id: invite.id,
      code: invite.inviteCode,
      guestName: invite.guest?.name,
      guestRelation: invite.guest?.relation,
    },
    event: {
      id: event.id,
      title: event.title,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      venueName: event.venueName,
      venueAddress: event.venueAddress,
      mapUrl: event.mapUrl,
      description: event.description,
      slug: event.slug,
    },
    sections: sectionsWithOverrides,
    variant: defaultVariant,
  });
}
```

- [ ] **Step 2: Create src/app/api/invites/[code]/rsvp/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { invites, rsvps } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { rsvpSubmitSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const invite = await db.query.invites.findFirst({
    where: eq(invites.inviteCode, code),
  });

  if (!invite) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = rsvpSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  // Upsert RSVP (one per invite)
  const existing = await db.query.rsvps.findFirst({
    where: eq(rsvps.inviteId, invite.id),
  });

  let rsvp;
  if (existing) {
    [rsvp] = await db
      .update(rsvps)
      .set({
        attendance: parsed.data.attendance,
        plusOnes: parsed.data.plusOnes,
        plusOneNames: parsed.data.plusOneNames,
        dietaryRestrictions: parsed.data.dietaryRestrictions,
        notes: parsed.data.notes,
        respondedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(rsvps.id, existing.id))
      .returning();
  } else {
    [rsvp] = await db
      .insert(rsvps)
      .values({
        inviteId: invite.id,
        attendance: parsed.data.attendance,
        plusOnes: parsed.data.plusOnes,
        plusOneNames: parsed.data.plusOneNames,
        dietaryRestrictions: parsed.data.dietaryRestrictions,
        notes: parsed.data.notes,
      })
      .returning();
  }

  // Update invite status
  await db
    .update(invites)
    .set({ status: "responded", updatedAt: new Date() })
    .where(eq(invites.id, invite.id));

  // Track analytics
  const { analyticsEvents } = await import("@/db/schema");
  await db.insert(analyticsEvents).values({
    eventId: invite.eventId,
    visitorId: code,
    action: "rsvp",
    metadata: { inviteId: invite.id, attendance: parsed.data.attendance },
  });

  return NextResponse.json({ success: true, rsvp });
}
```

- [ ] **Step 3: Create src/components/rsvp-form.tsx**

```typescript
"use client";

import { useState } from "react";

interface RsvpFormProps {
  inviteCode: string;
  guestName?: string;
  colorTokens?: Record<string, string>;
}

export default function RsvpForm({ inviteCode, guestName, colorTokens }: RsvpFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/invites/${inviteCode}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        attendance: formData.get("attendance"),
        plusOnes: parseInt(formData.get("plusOnes") as string, 10) || 0,
        plusOneNames: formData.get("plusOneNames"),
        dietaryRestrictions: formData.get("dietaryRestrictions"),
        notes: formData.get("notes"),
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit RSVP");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16 px-8">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-semibold mb-2" style={{ color: colorTokens?.primary }}>
          Cảm ơn bạn!
        </h2>
        <p className="text-zinc-500">
          {guestName ? `Đã nhận phản hồi của ${guestName}` : "Đã nhận phản hồi của bạn"}
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-xl mx-auto py-16 px-8"
      style={{ backgroundColor: colorTokens?.background || "#FFF8F0" }}
    >
      <h2
        className="text-2xl font-semibold text-center mb-8"
        style={{ color: colorTokens?.primary }}
      >
        Xác nhận tham dự
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Bạn có tham dự không? *</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "attending", label: "Có" },
              { value: "not_attending", label: "Không" },
              { value: "maybe", label: "Có thể" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center justify-center p-3 rounded-lg border cursor-pointer hover:border-rose-300 has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50"
              >
                <input
                  type="radio"
                  name="attendance"
                  value={opt.value}
                  required
                  className="sr-only"
                />
                <span className="text-sm font-medium">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Số người đi cùng</label>
          <input
            name="plusOnes"
            type="number"
            min="0"
            max="5"
            defaultValue="0"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tên người đi cùng</label>
          <input
            name="plusOneNames"
            placeholder="Nguyễn Văn A, Trần Thị B"
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Yêu cầu ăn uống</label>
          <textarea
            name="dietaryRestrictions"
            rows={2}
            placeholder="Dị ứng thực phẩm, chế độ ăn chay..."
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ghi chú</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Lời nhắn cho cô dâu chú rể..."
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: colorTokens?.primary || "#C41E3A" }}
        >
          {loading ? "Đang gửi..." : "Gửi xác nhận"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create src/app/invite/[code]/page.tsx**

```typescript
import { notFound } from "next/navigation";
import InviteRenderer from "@/components/invite-renderer";
import RsvpForm from "@/components/rsvp-form";
import { db } from "@/db";
import { invites } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;

  const invite = await db.query.invites.findFirst({
    where: eq(invites.inviteCode, code),
    with: { guest: true },
  });

  if (!invite) notFound();

  // Fetch full data via API (reuse route handler logic, or direct DB call)
  // For simplicity, fetch from the API route
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/invites/${code}`);

  if (!res.ok) notFound();

  const data = await res.json();
  const { event, sections, variant } = data;

  const visibleSections = sections.filter(
    (s: { visibility: string }) => s.visibility !== "hidden"
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: variant?.colorTokens?.background }}>
      <div className="max-w-5xl mx-auto">
        <InviteRenderer
          sections={visibleSections}
          colorTokens={variant?.colorTokens || {}}
        />

        <div className="mt-8">
          <RsvpForm
            inviteCode={code}
            guestName={data.invite?.guestName}
            colorTokens={variant?.colorTokens || {}}
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/invite/ src/app/api/invites/ src/components/rsvp-form.tsx
git commit -m "feat: public invite page + RSVP submission"
```

---

## Task 8: Analytics + Event Detail Page

**Goal:** Event dashboard with analytics, invite management, guest list.

**Files:**
- Create: `src/app/(dashboard)/events/[id]/page.tsx` — event detail
- Create: `src/app/api/events/[id]/analytics/route.ts`
- Create: `src/app/(dashboard)/events/[id]/invites/page.tsx`
- Create: `src/app/(dashboard)/events/[id]/analytics/page.tsx`

- [ ] **Step 1: Create src/app/api/events/[id]/analytics/route.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { analyticsEvents, invites, rsvps } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

async function getUserId(req: NextRequest) {
  const token = req.cookies.get("wedding_token")?.value;
  if (!token) return null;
  return verifyToken(token)?.userId ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: eventId } = await params;

  // Page views
  const pageViews = await db
    .select({ count: sql<number>`count(*)` })
    .from(analyticsEvents)
    .where(and(eq(analyticsEvents.eventId, eventId), eq(analyticsEvents.action, "page_view")));

  // RSVPs
  const rsvpCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(invites)
    .innerJoin(rsvps, eq(rsvps.inviteId, invites.id))
    .where(eq(invites.eventId, eventId));

  // Invite status breakdown
  const inviteStats = await db
    .select({
      status: invites.status,
      count: sql<number>`count(*)`,
    })
    .from(invites)
    .where(eq(invites.eventId, eventId))
    .groupBy(invites.status);

  // RSVP breakdown by attendance
  const attendanceStats = await db
    .select({
      attendance: rsvps.attendance,
      count: sql<number>`count(*)`,
    })
    .from(rsvps)
    .innerJoin(invites, eq(invites.id, rsvps.inviteId))
    .where(eq(invites.eventId, eventId))
    .groupBy(rsvps.attendance);

  // Daily views (last 30 days)
  const dailyViews = await db
    .select({
      date: sql<string>`date(created_at)`,
      count: sql<number>`count(*)`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventId, eventId),
        eq(analyticsEvents.action, "page_view")
      )
    )
    .groupBy(sql`date(created_at)`)
    .orderBy(sql`date(created_at) DESC`)
    .limit(30);

  return NextResponse.json({
    pageViews: pageViews[0]?.count || 0,
    rsvpCount: rsvpCount[0]?.count || 0,
    inviteStats,
    attendanceStats,
    dailyViews,
  });
}
```

- [ ] **Step 2: Create src/app/(dashboard)/events/[id]/analytics/page.tsx**

```typescript
import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventAnalyticsPage({ params }: PageProps) {
  const { id } = await params;
  const token = cookies().get("wedding_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, id), eq(events.userId, payload.userId)),
  });
  if (!event) return null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/events/${id}/analytics`, {
    headers: { cookie: `wedding_token=${token}` },
    cache: "no-store",
  });

  const stats = res.ok ? await res.json() : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/dashboard/events/${id}`}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            ← {event.title}
          </Link>
          <h1 className="text-2xl font-semibold mt-1">Analytics</h1>
        </div>
      </div>

      {stats ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-3xl font-bold">{stats.pageViews}</p>
              <p className="text-sm text-zinc-500 mt-1">Page views</p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <p className="text-3xl font-bold">{stats.rsvpCount}</p>
              <p className="text-sm text-zinc-500 mt-1">RSVPs submitted</p>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="space-y-2">
                {(stats.inviteStats as Array<{ status: string; count: number }>)?.map((s) => (
                  <div key={s.status} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{s.status}</span>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-zinc-500 mt-2">Invite status breakdown</p>
            </div>
          </div>

          {stats.attendanceStats && stats.attendanceStats.length > 0 && (
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-medium mb-4">RSVP Responses</h3>
              <div className="space-y-3">
                {(stats.attendanceStats as Array<{ attendance: string; count: number }>)?.map((a) => (
                  <div key={a.attendance} className="flex items-center gap-4">
                    <span className="w-32 text-sm text-zinc-500">{a.attendance}</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${(a.count / (stats.rsvpCount || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-zinc-500">Loading analytics...</div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create src/app/(dashboard)/events/[id]/page.tsx**

```typescript
import { db } from "@/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { events, invites, guests, rsvps } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const token = cookies().get("wedding_token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const event = await db.query.events.findFirst({
    where: and(eq(events.id, id), eq(events.userId, payload.userId)),
  });
  if (!event) return null;

  const eventInvites = await db.query.invites.findMany({
    where: eq(invites.eventId, id),
    with: { guest: true },
  });

  const guestCount = eventInvites.length;
  const sentCount = eventInvites.filter((i) => i.status !== "pending").length;
  const openedCount = eventInvites.filter((i) => i.status === "opened" || i.status === "responded").length;
  const respondedCount = eventInvites.filter((i) => i.status === "responded").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <p className="text-zinc-500 mt-1">
            {new Date(event.eventDate).toLocaleDateString("vi-VN")}
            {event.venueName ? ` • ${event.venueName}` : ""}
          </p>
        </div>
        <div className="flex gap-3">
          {event.status === "draft" && (
            <form action={async () => {
              "use server";
              // Publish action
            }}>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm">
                Publish
              </button>
            </form>
          )}
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="px-4 py-2 border rounded-lg font-medium text-sm hover:bg-zinc-50"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Guests", value: guestCount },
          { label: "Invites Sent", value: sentCount },
          { label: "Opened", value: openedCount },
          { label: "RSVP'd", value: respondedCount },
        ].map((s) => (
          <div key={s.label} className="bg-white p-4 rounded-xl border text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href={`/dashboard/events/${id}/guests`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Guests</h3>
          <p className="text-sm text-zinc-500">Import + manage guest list</p>
        </Link>
        <Link
          href={`/dashboard/events/${id}/invites`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Invites</h3>
          <p className="text-sm text-zinc-500">View and share invite links</p>
        </Link>
        <Link
          href={`/dashboard/events/${id}/analytics`}
          className="bg-white p-6 rounded-xl border hover:shadow-md transition-shadow"
        >
          <h3 className="font-semibold mb-1">Analytics</h3>
          <p className="text-sm text-zinc-500">Views and RSVP tracking</p>
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(dashboard\)/events/\[id\]/page.tsx src/app/\(dashboard\)/events/\[id\]/analytics/page.tsx src/app/api/events/\[id\]/analytics/route.ts
git commit -m "feat: event detail dashboard + analytics"
```

---

## Task 9: Smoke Test + Root Page

**Goal:** Replace landing page, verify full flow.

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/invite/[code]/not-found.tsx`

- [ ] **Step 1: Replace src/app/page.tsx with landing page**

```typescript
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between max-w-5xl mx-auto w-full">
        <span className="text-xl font-semibold">Wedding Invite</span>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700"
          >
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Wedding invitations
          <br />
          <span className="text-rose-600">made beautiful</span>
        </h1>
        <p className="text-xl text-zinc-500 max-w-xl mb-8">
          Create stunning digital wedding invitations with beautiful templates.
          Import guests, track RSVPs, and share easily.
        </p>
        <div className="flex gap-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
          >
            Create free invitation
          </Link>
          <Link
            href="/dashboard/templates"
            className="px-6 py-3 border rounded-xl font-medium hover:bg-zinc-50 transition-colors"
          >
            Browse templates
          </Link>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-sm text-zinc-400">
        © 2026 Wedding Invite
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/invite/[code]/not-found.tsx**

```typescript
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">404</h1>
        <p className="text-zinc-500 mb-6">This invitation was not found or has expired.</p>
        <a
          href="/"
          className="text-rose-600 font-medium hover:underline"
        >
          Go to homepage
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/invite/\[code\]/not-found.tsx
git commit -m "feat: landing page + invite 404"
```

---

## Quality Gate Checklist

After completing all tasks:

- [ ] `pnpm run build` passes clean
- [ ] `npx drizzle-kit migrate` runs without error
- [ ] `npm run db:seed` inserts templates + sections
- [ ] Auth flow: register → login → dashboard
- [ ] Create event with slug collision → 409 error returned
- [ ] Guest import: CSV with bad rows → partial success with error list
- [ ] Public invite `/invite/ABC123` → renders sections + RSVP form
- [ ] RSVP submit → invite status updated to `responded`
- [ ] Analytics page shows page views + RSVP counts
- [ ] Middleware redirect: unauthenticated → `/login`
- [ ] Middleware redirect: authenticated `/login` → `/dashboard/events`

---

## Execution Options

**Plan complete and saved to `docs/superpowers/plans/2026-05-16-wedding-saas-mvp.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?