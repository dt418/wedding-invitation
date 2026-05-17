# Templates Modal Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/templates` modal interaction where card click opens details modal with actions (**Create New**, **View Demo**) and implement public preset demo route.

**Architecture:** Split `/templates` into server data loader + client interaction layer. Keep DB fetching in server component, pass serialized template list to client component that handles modal state, focus/escape/backdrop close, and navigation actions. Add new public demo route at `/invite/[slug]/demo` that renders template-backed preview with sample content and no RSVP side effects.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, existing Tailwind UI tokens/components.

---

## File Structure Map

- **Modify:** `src/app/(dashboard)/templates/page.tsx`
  - Keep server-side template query/grouping.
  - Delegate interactive rendering to a client component.
- **Create:** `src/components/templates/templates-gallery-client.tsx`
  - Card grid interactions, selected-template state, modal open/close.
- **Create:** `src/components/templates/template-action-modal.tsx`
  - Accessible modal UI + action buttons.
- **Create:** `src/app/invite/[slug]/demo/page.tsx`
  - Public preset demo route; loads template by slug.
- **Create:** `src/app/invite/[slug]/demo/not-found.tsx`
  - Demo not-found state.
- **Test/Verify:** lint/build + manual browser checks.

---

### Task 1: Baseline and regression guard

**Files:**
- Modify: none
- Test: command-only baseline

- [ ] **Step 1: Capture current status before edits**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 2: Capture current `/templates` behavior note**

Run app and verify card click currently navigates directly to `/events/new?templateId=...`.
Expected: confirms baseline behavior before modal change.

- [ ] **Step 3: Commit checkpoint (optional but recommended)**

```bash
git add -A
git commit -m "chore: capture baseline before templates modal work"
```

---

### Task 2: Extract client gallery layer for modal state

**Files:**
- Modify: `src/app/(dashboard)/templates/page.tsx`
- Create: `src/components/templates/templates-gallery-client.tsx`
- Test: `/templates` renders same cards

- [ ] **Step 1: Write failing expectation comment in plan-driven check**

Manual expectation: clicking card should no longer route immediately; modal should open.

- [ ] **Step 2: Create client gallery component skeleton**

```tsx
// src/components/templates/templates-gallery-client.tsx
"use client";

export type TemplateListItem = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
};

type Props = {
  grouped: Record<string, TemplateListItem[]>;
  categoryLabels: Record<string, string>;
};

export function TemplatesGalleryClient({ grouped, categoryLabels }: Props) {
  return <div>{/* render same grid here */}</div>;
}
```

- [ ] **Step 3: Move card/grid rendering from page into client component**

```tsx
// src/app/(dashboard)/templates/page.tsx (render section)
<TemplatesGalleryClient grouped={grouped} categoryLabels={categoryLabels} />
```

- [ ] **Step 4: Ensure visual parity before modal logic**

Run: `pnpm lint`
Expected: pass, `/templates` still displays grouped cards exactly.

- [ ] **Step 5: Commit**

```bash
git add src/app/(dashboard)/templates/page.tsx src/components/templates/templates-gallery-client.tsx
git commit -m "refactor: move templates gallery rendering to client component"
```

---

### Task 3: Add action modal UI component

**Files:**
- Create: `src/components/templates/template-action-modal.tsx`
- Modify: `src/components/templates/templates-gallery-client.tsx`
- Test: modal open/close behaviors

- [ ] **Step 1: Create modal component with required props**

```tsx
// src/components/templates/template-action-modal.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type TemplateModalData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  thumbnailUrl: string | null;
  isPremium: boolean;
};

type Props = {
  template: TemplateModalData | null;
  categoryLabel: string;
  onClose: () => void;
};

export function TemplateActionModal({ template, categoryLabel, onClose }: Props) {
  if (!template) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Template actions">
      {/* backdrop + panel + action links */}
    </div>
  );
}
```

- [ ] **Step 2: Implement modal actions URLs**

```tsx
const createUrl = `/events/new?templateId=${template.id}`;
const demoUrl = `/invite/${template.slug}/demo`;
```

- [ ] **Step 3: Wire selected-template state in gallery client**

```tsx
const [selectedTemplate, setSelectedTemplate] = useState<TemplateListItem | null>(null);

// card click
onClick={() => setSelectedTemplate(tmpl)}

<TemplateActionModal
  template={selectedTemplate}
  categoryLabel={selectedTemplate ? (categoryLabels[selectedTemplate.category] || selectedTemplate.category) : ""}
  onClose={() => setSelectedTemplate(null)}
/>
```

- [ ] **Step 4: Add close interactions**

Implement:
- backdrop click closes
- close button closes
- Escape key closes via `useEffect`

- [ ] **Step 5: Run lint and manual modal checks**

Run: `pnpm lint`
Expected: pass.

Manual checks:
- clicking any card opens modal
- modal shows name/description/badges/image
- Escape/backdrop/close button dismiss correctly

- [ ] **Step 6: Commit**

```bash
git add src/components/templates/template-action-modal.tsx src/components/templates/templates-gallery-client.tsx
git commit -m "feat: add template action modal on gallery cards"
```

---

### Task 4: Build public preset demo route

**Files:**
- Create: `src/app/invite/[slug]/demo/page.tsx`
- Create: `src/app/invite/[slug]/demo/not-found.tsx`
- Test: route resolution for valid/invalid slug

- [ ] **Step 1: Create demo route loader by template slug**

```tsx
// src/app/invite/[slug]/demo/page.tsx
import { db } from "@/db";
import { templates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function TemplateDemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await db.query.templates.findFirst({ where: eq(templates.slug, slug) });
  if (!template) notFound();

  return <div>{/* preview-mode template rendering */}</div>;
}
```

- [ ] **Step 2: Render safe preset demo content**

Include:
- "Preview Mode" banner
- template name + description
- representative sample sections/content
- no submit forms/mutations

- [ ] **Step 3: Add not-found page**

```tsx
// src/app/invite/[slug]/demo/not-found.tsx
import Link from "next/link";

export default function TemplateDemoNotFound() {
  return (
    <div>
      <h1>Demo not found</h1>
      <Link href="/templates">Back to templates</Link>
    </div>
  );
}
```

- [ ] **Step 4: Run build to validate new route tree**

Run: `pnpm build`
Expected: build success; route list contains `/invite/[slug]/demo`.

- [ ] **Step 5: Commit**

```bash
git add src/app/invite/[slug]/demo/page.tsx src/app/invite/[slug]/demo/not-found.tsx
git commit -m "feat: add preset template demo route by slug"
```

---

### Task 5: Final UX polish + verification

**Files:**
- Modify: `src/components/templates/template-action-modal.tsx`
- Modify: `src/components/templates/templates-gallery-client.tsx`
- Test: lint/build/manual browser

- [ ] **Step 1: Add transition + responsive modal layout**

Implement:
- desktop centered panel
- mobile bottom-sheet style
- fade/scale transitions
- preserve reduced-motion behavior

- [ ] **Step 2: Keyboard/accessibility pass**

Implement/check:
- visible focus styles on action buttons
- tab order usable
- `aria-modal`, `role="dialog"`, label/heading semantics

- [ ] **Step 3: End-to-end manual flow check**

Validate:
1. open `/templates`
2. click card -> modal opens
3. click **Create New** -> `/events/new?templateId=...`
4. reopen modal, click **View Demo** -> `/invite/[slug]/demo`
5. invalid demo slug -> not-found page

- [ ] **Step 4: Final verification commands**

Run: `pnpm lint && pnpm build`
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/templates/template-action-modal.tsx src/components/templates/templates-gallery-client.tsx src/app/(dashboard)/templates/page.tsx src/app/invite/[slug]/demo/page.tsx src/app/invite/[slug]/demo/not-found.tsx
git commit -m "feat: templates modal actions with demo preview flow"
```

---

## Spec Coverage Check

- Modal opens on card click: covered (Task 3).
- Modal shows details + 2 actions: covered (Task 3).
- Create New opens new page with templateId: covered (Task 3, Task 5).
- View Demo opens preset template page: covered (Task 3 + Task 4).
- Demo page public/no RSVP mutations: covered (Task 4).
- Accessibility close mechanics: covered (Task 3 + Task 5).

## Placeholder Scan

No TBD/TODO placeholders in executable steps.

## Type Consistency Check

- Shared modal data uses `id`, `slug`, `name`, `category`, `description`, `thumbnailUrl`, `isPremium` consistently across tasks.
- Demo route keyed by `slug` consistently in modal URL + route loader.
