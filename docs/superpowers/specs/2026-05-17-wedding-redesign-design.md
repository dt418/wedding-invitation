# Wedding Invitation Redesign — Design Spec

Date: 2026-05-17
Goal: Boost signup conversion + build premium brand trust. Exceed chungdoi.com quality.
Target: Mixed audience (couples 22–30, 30–40, family/event planners).
Brand: Elegant luxury + warm romantic.

---

## Scope

This spec covers two surfaces:

1. **Landing Page** (`src/app/page.tsx`) — public conversion page
2. **Dashboard** (`src/app/(dashboard)/`) — authenticated app (from existing spec)

---

## Part A: Landing Page

### Design System

**Pattern:** Conversion-first Premium with Storytelling elements.
**Style:** Soft UI Evolution — warm, premium, accessible.
**Mood:** Elegant luxury + warm romantic.

**Color Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#DB2777` | CTAs, accents (romantic pink) |
| `--color-on-primary` | `#FFFFFF` | Text on primary |
| `--color-secondary` | `#F472B6` | Subtle highlights |
| `--color-accent` | `#CA8A04` | Gold accents, premium CTAs |
| `--color-background` | `#FDF2F8` | Page background (warm blush) |
| `--color-foreground` | `#831843` | Primary text |
| `--color-muted` | `#F0EDF4` | Cards, surfaces |
| `--color-border` | `#FBCFE8` | Borders, dividers |
| `--color-ring` | `#DB2777` | Focus rings |
| `--color-destructive` | `#DC2626` | Errors |

**Typography:**
- Headings: `Cormorant Infant` (300, 400, 500, 600, 700) — romantic, elegant
- Body: `Plus Jakarta Sans` (400, 500, 600) — modern, readable
- Hero accent: `Great Vibes` — script for emotional highlights
- Scale: 40px/48px h1, 28px/36px h2, 15px/28px body, 13px/20px label

**Effects:**
- Cards: `border-radius: 24px`, `box-shadow: 0 8px 24px rgba(0,0,0,0.04)`
- Soft shadows, 200–300ms transitions, focus visible at 4px ring
- No emojis as icons — use Lucide/Heroicons SVG

**Accessibility:**
- WCAG AA+ contrast ratios
- prefers-reduced-motion support
- Keyboard navigation with visible focus rings

### Page Structure

```
Hero
  ↓
Trust Strip
  ↓
Template Showcase
  ↓
Interactive Preview / Demo
  ↓
How It Works
  ↓
Feature Highlights
  ↓
Social Proof
  ↓
Testimonials
  ↓
FAQ
  ↓
Final CTA
  ↓
Footer
```

### Section Details

#### 1. Hero
- Full-width, warm gradient background (#FDF2F8 → #FBCFE8) or subtle floral pattern
- Headline: romantic + benefit (e.g., "Thiệp cưới đẹp như mơ — gửi trong vài phút")
- Subheadline: emotional + functional benefit
- Dual CTA: "Tạo thiệp ngay" (primary, rose) + "Xem hướng dẫn" (ghost)
- Optional: hero image/illustration with couple silhouette
- Trust micro-copy below CTAs: "Miễn phí • Không cần tạo tài khoản trước"

#### 2. Trust Strip
- Horizontal strip below hero
- 3–4 metrics with icons: "10,000+ thiệp đã gửi" | "98% khách hàng hài lòng" | "50+ mẫu template"
- Subtle divider above/below
- Horizontal scroll on mobile, centered on desktop

#### 3. Template Showcase
- Section heading: "Mẫu thiệp được yêu thích nhất"
- Category filter tabs: Tất cả | Hiện đại | Cổ điển | Tối giản | Tính năng
- Bento/masonry grid: 3–5 template cards
- Each card: thumbnail, name, category badge, hover overlay with "Xem trước"
- "Xem tất cả templates →" link

#### 4. Interactive Preview / Demo
- "Thử nghiệm thiệp của bạn" heading
- Live mini-editor: input couple names, wedding date
- Before/after toggle: static preview vs animated preview
- "Gửi thử cho mình" CTA button
- Real-time update as user types

#### 5. How It Works
- Heading: "3 bước tạo thiệp"
- 3 step cards (horizontal on desktop, vertical on mobile)
- Each: step number, icon, title, short description
- Steps: Chọn template → Tùy chỉnh nội dung → Gửi cho khách

#### 6. Feature Highlights
- 2-column grid with icon + heading + description
- 5–6 key features with alternating emphasis
- Features: Import khách, Theo dõi RSVP, QR code, Chia sẻ link, Phân tích, Hỗ trợ đa ngôn ngữ

#### 7. Social Proof
- Counter strip with animated count-up on scroll
- Metrics: "10,000+ thiệp gửi", "5,000+ cặp đôi", "30+ quốc gia", "98% hài lòng"
- Subtle background color or pattern

#### 8. Testimonials
- Heading: "Cặp đôi nói gì về chúng tôi"
- Carousel or grid of chat-style testimonials
- Each: avatar, name, couple story snippet, star rating
- Multilingual voices included
- 3–5 testimonials visible

#### 9. FAQ
- Heading: "Câu hỏi thường gặp"
- Accordion or 2-column grid
- 5–8 targeted questions with answers
- Categories: Getting Started, Templates, Pricing, Technical

#### 10. Final CTA
- Centered, bold headline: "Sẵn sàng tạo thiệp cưới đẹp?"
- Email capture form OR "Bắt đầu miễn phí" button
- Subtle background color or image

#### 11. Footer
- 4-column layout: Product | Templates | Resources | Company
- Links: About, Contact, Privacy, Terms
- Newsletter signup
- Social media icons
- Copyright: "© 2026 Wedding Invite"

### Responsive Breakpoints

- Mobile first: 375px base
- Tablet: 768px
- Desktop: 1024px
- Large: 1440px

### Motion & Animation

- Duration: 150–300ms for micro-interactions
- Easing: ease-out for enter, ease-in for exit
- Count-up animation on social proof section (on scroll)
- Hover lift on cards: `transform: translateY(-2px)`
- Stagger on template grid entrance: 50ms per item
- prefers-reduced-motion: disable animations

---

## Part B: Dashboard

Reference: `docs/superpowers/specs/2026-05-16-wedding-saas-design.md`

### Key Tokens

**Color Palette:**
| Token | Hex | Usage |
|-------|-----|-------|
| `--dashboard-background` | `#F7F5F2` | Page background (warm cream) |
| `--dashboard-surface` | `#FFFFFF` | Cards, modals |
| `--dashboard-primary` | `#A61B1B` | Primary actions (deep rose) |
| `--dashboard-text` | `#1F1F1F` | Primary text |
| `--dashboard-text-soft` | `#666666` | Secondary text |
| `--dashboard-border` | `#ECE5DE` | Borders, dividers |

**Typography:**
- Headings: Plus Jakarta Sans (600)
- Body: Be Vietnam Pro (400, 500)

**Layout:**
- Sidebar: 280px, white, 1px border-right
- Topbar: 72px, backdrop-blur
- Content: 12-column grid, 32px padding, 24px gaps

**Cards:**
- `border-radius: 24px`
- `box-shadow: 0 8px 24px rgba(0,0,0,0.04)`
- `border: 1px solid #F0EBE5`

**Inputs:**
- Height: 52px
- `border-radius: 16px`
- `border: 1px solid #E8E0D8`
- Focus: `#A61B1B` + 4px ring

**Buttons:**
- Primary: `#A61B1B`, `border-radius: 999px`, 14px 24px padding
- Secondary: `#F5ECE5` bg, `#A61B1B` text

**Motion:**
- Hover lift: `translateY(-2px)`
- Fade transitions: 250ms ease

---

## Implementation Notes

1. Landing page is the priority — implement first.
2. Dashboard follows existing spec at `2026-05-16-wedding-saas-design.md`.
3. Shared component library: create `/src/components/ui/` for primitives.
4. Landing page uses its own token set (--color-primary, --color-background, etc.) separate from dashboard tokens.
5. No emojis as icons — use Lucide React SVG throughout.
6. All interactive elements get `cursor-pointer` and hover/press feedback.
7. Mobile-first responsive design — test at 375px and 768px.
8. Accessibility: ARIA labels, keyboard nav, focus states, color contrast 4.5:1.

---

## Out of Scope

- Auth pages redesign (covered separately)
- Invite rendering page redesign
- Database schema changes
- API changes

---

## Dependencies

- `lucide-react` for icons (add if not installed)
- Google Fonts: Cormorant Infant, Plus Jakarta Sans, Be Vietnam Pro, Great Vibes

---

## 2026-05-17 Implementation Sync (Current State)

### Delivered landing updates (implemented)
- Hero rebuilt to competitor-grade 2-column structure with:
  - semantic classes (`hero`, `hero-left`, `hero-right`, `hero-visual`, `phone-frame`, `phone-screen`, `phone-notch`, `thiep-preview`, `phone-info`, `floating-card`, `fc-*`)
  - full-height mobile mockup (`w-[260px]`, `h-[460px]`), floating stat cards, and decorative trust zone
  - Vietnamese-first copy and dual CTA flow
- Trust/social blocks upgraded with large numeric proof and support-chat style proof
- Template showcase upgraded to 8 Vietnamese card concepts with tags, "Mới" badges, and calibrated gradients (Song Long Đỏ already aligned to `#7a1428 → #c4283a → #7a1428`)
- How-it-works now has real step-synced visual states:
  - step 1: template grid preview
  - step 2: customize info preview
  - step 3: share + RSVP preview
  - auto-cycle (`3500ms`) and active-step sync
- Added `Pricing` (`#gia`) and `Testimonials` sections; fixed anchor mismatch from old `#pricing`
- Footer expanded with multi-column product/tools/resources/cooperation links and multilingual links

### Motion system now active
- Scroll reveal animation wrapper via `useInView` + `AnimatedSection`
- Hover-lift motion on template and content cards
- Floating keyframes for phone mockup and floating cards:
  - `.phone-frame { animation: float 4s ease-in-out infinite; }`
  - `.floating-card { animation: float-card 5s ease-in-out infinite; }`
- `prefers-reduced-motion` fallback preserved in global styles

### Files reflecting final delivered behavior
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/lib/useInView.ts`

### Notes
- Keep original project font/color system baseline; only fill missing UI/UX pieces and interaction polish.
- Current implementation is build/lint clean.

*Last updated: 2026-05-17 (synced with implemented UI state)*