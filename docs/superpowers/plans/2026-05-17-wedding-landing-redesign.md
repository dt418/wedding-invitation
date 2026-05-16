# Wedding Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page with a premium, romantic design that exceeds chungdoi.com quality. Boost signup conversion through emotional storytelling, social proof, and conversion-focused structure.

**Architecture:** Full redesign of `src/app/page.tsx` as a multi-section landing page. Shared UI primitives extracted to `src/components/ui/`. Landing page uses its own design token set (separate from dashboard tokens). No emojis as icons — Lucide React throughout.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Lucide React, Google Fonts

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                        # Landing page (full rebuild)
│   ├── layout.tsx                       # Update font imports
│   └── globals.css                      # Landing design tokens
└── components/
    └── ui/
        ├── button.tsx                   # Primary/secondary/ghost variants
        ├── badge.tsx                    # Category badges
        ├── card.tsx                     # Card with hover lift
        ├── section-wrapper.tsx          # Consistent section padding
        └── icons.tsx                    # Lucide re-exports (no emoji)
```

---

## Task 1: Add Lucide React & Update Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Lucide React**

Run: `pnpm add lucide-react`

- [ ] **Step 2: Verify installation**

Run: `grep -q '"lucide-react"' package.json && echo "installed" || echo "missing"`

Expected: `installed`

---

## Task 2: Create UI Component Library

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/section-wrapper.tsx`
- Create: `src/components/ui/icons.tsx`

---

### Task 2a: Button Component

- [ ] **Step 1: Create button.tsx**

```typescript
// src/components/ui/button.tsx
"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
  secondary: "bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300",
  ghost: "bg-transparent text-rose-700 hover:bg-rose-50 active:bg-rose-100",
  outline: "bg-transparent border border-rose-300 text-rose-700 hover:bg-rose-50 active:bg-rose-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-5 text-base rounded-xl",
  lg: "h-14 px-7 text-lg rounded-2xl font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

---

### Task 2b: Badge Component

- [ ] **Step 1: Create badge.tsx**

```typescript
// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "subtle";
  className?: string;
}

const badgeStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-rose-100 text-rose-700",
  outline: "bg-transparent border border-rose-200 text-rose-600",
  subtle: "bg-zinc-100 text-zinc-600",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

---

### Task 2c: Card Component

- [ ] **Step 1: Create card.tsx**

```typescript
// src/components/ui/card.tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl border border-rose-100 shadow-[0_8px_24px_rgba(0,0,0,0.04)]",
        hover && "transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

### Task 2d: Section Wrapper

- [ ] **Step 1: Create section-wrapper.tsx**

```typescript
// src/components/ui/section-wrapper.tsx
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24 px-6", className)}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  );
}
```

---

### Task 2e: Icons Re-export

- [ ] **Step 1: Create icons.tsx**

```typescript
// src/components/ui/icons.tsx
// Re-export Lucide icons — NO emoji
export {
  Heart,
  Sparkles,
  Users,
  Globe,
  QrCode,
  BarChart3,
  Mail,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  Star,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Play,
  Menu,
  X,
  Menu,
} from "lucide-react";
```

---

### Task 2f: Create lib/utils.ts

- [ ] **Step 1: Create utility file**

Run: `mkdir -p src/lib`

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Install clsx + tailwind-merge**

Run: `pnpm add clsx tailwind-merge`

---

## Task 3: Update Layout with Google Fonts

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Read current layout**

Run: `cat src/app/layout.tsx`

- [ ] **Step 2: Update layout.tsx with fonts**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Cormorant_Infant, Plus_Jakarta_Sans, Great_Vibes } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Infant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wedding Invite — Thiệp cưới đẹp như mơ",
  description: "Tạo thiệp cưới digital stunning với beautiful templates. Import guests, track RSVPs, share easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${cormorant.variable} ${plusJakarta.variable} ${greatVibes.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

---

## Task 4: Update globals.css with Landing Tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write updated globals.css**

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  /* Landing Page Design Tokens */
  --color-primary: #DB2777;
  --color-on-primary: #FFFFFF;
  --color-secondary: #F472B6;
  --color-accent: #CA8A04;
  --color-background: #FDF2F8;
  --color-foreground: #831843;
  --color-muted: #F0EDF4;
  --color-border: #FBCFE8;
  --color-ring: #DB2777;
  --color-destructive: #DC2626;

  /* Typography */
  --font-cormorant: "Cormorant Infant", serif;
  --font-plus-jakarta: "Plus Jakarta Sans", sans-serif;
  --font-great-vibes: "Great Vibes", cursive;

  --background: var(--color-background);
  --foreground: var(--color-foreground);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-plus-jakarta);
  --font-serif: var(--font-cormorant);
  --font-accent: var(--font-great-vibes);
}

/* Base styles */
body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-plus-jakarta), system-ui, sans-serif;
}

/* Typography scale */
.text-hero {
  font-family: var(--font-cormorant);
  font-size: 3.5rem;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.text-section-title {
  font-family: var(--font-cormorant);
  font-size: 2.5rem;
  line-height: 1.2;
  font-weight: 600;
}

.text-script {
  font-family: var(--font-great-vibes);
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Animation utilities */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
}

/* Count-up animation placeholder */
@keyframes countUp {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

---

## Task 5: Build Hero Section

**Files:**
- Modify: `src/app/page.tsx` (add Hero section first)

- [ ] **Step 1: Add Hero section to page.tsx**

```typescript
// src/app/page.tsx
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-20">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <header className="absolute top-0 left-0 right-0 px-6 py-5 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-rose-700" style={{ fontFamily: "var(--font-cormorant)" }}>
              Wedding Invite
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/templates" className="text-sm text-zinc-600 hover:text-rose-700 transition-colors">
              Templates
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-600 hover:text-rose-700 transition-colors">
              Pricing
            </Link>
            <Link href="/help" className="text-sm text-zinc-600 hover:text-rose-700 transition-colors">
              Help
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-600 hover:text-rose-700 transition-colors">
              Sign in
            </Link>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-script text-3xl text-rose-500 mb-6">Wedding Invitations</p>
          <h1 className="text-hero text-rose-900 mb-6">
            Thiệp cưới đẹp như mơ
            <br />
            <span className="text-rose-600">gửi trong vài phút</span>
          </h1>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Tạo thiệp cưới digital stunning với hàng trăm template đẹp.
            Import khách mời, theo dõi RSVP, chia sẻ dễ dàng.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/register">
                Tạo thiệp ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/demo">
                Xem hướng dẫn
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            Miễn phí • Không cần tạo tài khoản trước
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-rose-400" />
        </div>
      </section>

      {/* Placeholder for other sections - to be added in subsequent tasks */}
    </div>
  );
}
```

Note: The above is the first section. Other sections (Trust Strip, Template Showcase, etc.) will be added in Task 6.

---

## Task 6: Build Remaining Landing Sections

**Files:**
- Modify: `src/app/page.tsx` (add all sections)

This task adds sections: Trust Strip → Template Showcase → How It Works → Feature Highlights → Social Proof → Testimonials → FAQ → Final CTA → Footer

- [ ] **Step 1: Add Trust Strip**

```typescript
// After Hero, add Trust Strip section
<section className="py-8 bg-white/50 border-y border-rose-100">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
      <div className="flex items-center gap-3">
        <Mail className="w-6 h-6 text-rose-500" />
        <div>
          <p className="font-semibold text-rose-900">10,000+</p>
          <p className="text-sm text-zinc-500">Thiệp đã gửi</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Star className="w-6 h-6 text-rose-500" />
        <div>
          <p className="font-semibold text-rose-900">98%</p>
          <p className="text-sm text-zinc-500">Khách hàng hài lòng</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-rose-500" />
        <div>
          <p className="font-semibold text-rose-900">50+</p>
          <p className="text-sm text-zinc-500">Mẫu template</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-rose-500" />
        <div>
          <p className="font-semibold text-rose-900">30+</p>
          <p className="text-sm text-zinc-500">Quốc gia</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Add Template Showcase**

```typescript
// Template Showcase Section
<section className="py-20 px-6 bg-gradient-to-b from-white to-rose-50">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-section-title text-rose-900 mb-4">
        Mẫu thiệp được yêu thích nhất
      </h2>
      <p className="text-zinc-600 max-w-xl mx-auto">
        Khám phá bộ sưu tập template đa dạng cho mọi phong cách wedding
      </p>
    </div>

    {/* Category tabs */}
    <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
      {["Tất cả", "Hiện đại", "Cổ điển", "Tối giản", "Elegant"].map((tab, i) => (
        <button
          key={tab}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            i === 0
              ? "bg-rose-600 text-white"
              : "bg-white text-zinc-600 hover:bg-rose-50"
          )}
        >
          {tab}
        </button>
      ))}
    </div>

    {/* Template grid - bento style */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className={cn(
            "relative aspect-[4/3] rounded-3xl overflow-hidden group cursor-pointer",
            "bg-gradient-to-br from-rose-100 to-pink-200",
            i === 1 && "md:col-span-2 md:row-span-2"
          )}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Xem trước →
            </p>
          </div>
        </div>
      ))}
    </div>

    <div className="text-center mt-10">
      <Button variant="outline" asChild>
        <Link href="/templates">
          Xem tất cả templates
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add How It Works**

```typescript
// How It Works Section
<section className="py-20 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-section-title text-rose-900 mb-4">
        3 bước tạo thiệp
      </h2>
      <p className="text-zinc-600">Đơn giản như ABC</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {[
        {
          step: 1,
          icon: Sparkles,
          title: "Chọn template",
          desc: "Browse hàng trăm mẫu thiệp đẹp, phù hợp mọi phong cách",
        },
        {
          step: 2,
          icon: Calendar,
          title: "Tùy chỉnh nội dung",
          desc: "Thêm tên cô dâu chú rể, ngày cưới, địa điểm và thông tin",
        },
        {
          step: 3,
          icon: Mail,
          title: "Gửi cho khách",
          desc: "Share link hoặc gửi trực tiếp qua email, SMS, WhatsApp",
        },
      ].map(({ step, icon: Icon, title, desc }) => (
        <div key={step} className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-rose-600" />
          </div>
          <div className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
            {step}
          </div>
          <h3 className="text-xl font-semibold text-rose-900 mb-3">{title}</h3>
          <p className="text-zinc-600">{desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Add Feature Highlights**

```typescript
// Feature Highlights Section
<section className="py-20 px-6 bg-rose-50">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-section-title text-rose-900 mb-4">
        Tính năng nổi bật
      </h2>
      <p className="text-zinc-600">Mọi thứ bạn cần để quản lý wedding invitation</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { icon: Users, title: "Import khách mời", desc: "Upload Excel/CSV hoặc nhập thủ công. Quản lý danh sách khách dễ dàng" },
        { icon: CheckCircle, title: "Theo dõi RSVP", desc: "Theo dõi tình trạng xác nhận của từng khách. Biết chính xác ai sẽ đến" },
        { icon: QrCode, title: "QR Code", desc: "Tự động tạo QR cho từng thiệp. Khách check-in nhanh chóng" },
        { icon: Globe, title: "Đa ngôn ngữ", desc: "Hỗ trợ Tiếng Việt, English, và nhiều ngôn ngữ khác" },
        { icon: BarChart3, title: "Phân tích chi tiết", desc: "Xem số lượt mở, tỷ lệ RSVP, nguồn khách đến từ đâu" },
        { icon: Mail, title: "Chia sẻ dễ dàng", desc: "Gửi qua email, SMS, WhatsApp, hoặc copy link chia sẻ" },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex gap-4 p-6 bg-white rounded-2xl">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h3 className="font-semibold text-rose-900 mb-2">{title}</h3>
            <p className="text-sm text-zinc-600">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 5: Add Social Proof Counter**

```typescript
// Social Proof Section
<section className="py-20 px-6 bg-rose-600 text-white">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      {[
        { value: "10,000+", label: "Thiệp gửi" },
        { value: "5,000+", label: "Cặp đôi" },
        { value: "30+", label: "Quốc gia" },
        { value: "98%", label: "Hài lòng" },
      ].map(({ value, label }) => (
        <div key={label}>
          <p className="text-4xl md:text-5xl font-bold mb-2">{value}</p>
          <p className="text-rose-200">{label}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 6: Add Testimonials**

```typescript
// Testimonials Section
<section className="py-20 px-6 bg-white">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-section-title text-rose-900 mb-4">
        Cặp đôi nói gì về chúng tôi
      </h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          name: "Minh & Hương",
          location: "TP.HCM",
          text: "Thiệp của chúng mình nhận được rất nhiều lời khen. Setup nhanh, khách mời feedback tốt!",
          rating: 5,
        },
        {
          name: "Anh & Chi",
          location: "Hà Nội",
          text: "Tính năng RSVP giúp mình theo dõi danh sách khách dễ dàng. Tiết kiệm rất nhiều thời gian.",
          rating: 5,
        },
        {
          name: "Tuấn & Ngọc",
          location: "Đà Nẵng",
          text: "Template đẹp, dễ tùy chỉnh. Khách của mình rất thích thiệp digital vì tiện lợi.",
          rating: 5,
        },
      ].map(({ name, location, text, rating }) => (
        <div key={name} className="p-6 bg-rose-50 rounded-2xl">
          <div className="flex gap-1 mb-4">
            {Array.from({ length: rating }).map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
            ))}
          </div>
          <p className="text-zinc-700 mb-4">&quot;{text}&quot;</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-200 rounded-full flex items-center justify-center">
              <span className="text-rose-700 font-semibold">{name[0]}</span>
            </div>
            <div>
              <p className="font-semibold text-rose-900">{name}</p>
              <p className="text-sm text-zinc-500">{location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 7: Add FAQ Section**

```typescript
// FAQ Section
<section className="py-20 px-6 bg-rose-50">
  <div className="max-w-3xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-section-title text-rose-900 mb-4">
        Câu hỏi thường gặp
      </h2>
    </div>

    <div className="space-y-4">
      {[
        {
          q: "Làm sao để bắt đầu?",
          a: "Đăng ký miễn phí, chọn template, tùy chỉnh nội dung và gửi cho khách. Đơn giản như vậy!",
        },
        {
          q: "Tôi có thể sử dụng bao nhiêu template?",
          a: "Bạn có thể truy cập tất cả template miễn phí. Premium templates yêu cầu upgrade.",
        },
        {
          q: "Làm sao gửi thiệp cho khách?",
          a: "Copy link và gửi qua email, SMS, WhatsApp, hoặc bất kỳ kênh nào bạn muốn.",
        },
        {
          q: "Thiệp có hiển thị tốt trên điện thoại không?",
          a: "Tất cả thiệp được thiết kế responsive, hiển thị hoàn hảo trên mọi thiết bị.",
        },
        {
          q: "Tôi có thể theo dõi ai đã mở thiệp không?",
          a: "Có! Dashboard hiển thị số lượt mở, thời gian mở, và tình trạng RSVP.",
        },
      ].map(({ q, a }) => (
        <details key={q} className="group bg-white rounded-2xl">
          <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
            <span className="font-semibold text-rose-900">{q}</span>
            <ChevronDown className="w-5 h-5 text-rose-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-6 pb-6 text-zinc-600">
            {a}
          </div>
        </details>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 8: Add Final CTA**

```typescript
// Final CTA Section
<section className="py-20 px-6 bg-gradient-to-b from-rose-100 to-rose-50">
  <div className="max-w-3xl mx-auto text-center">
    <h2 className="text-section-title text-rose-900 mb-6">
      Sẵn sàng tạo thiệp cưới đẹp?
    </h2>
    <p className="text-xl text-zinc-600 mb-10">
      Bắt đầu miễn phí ngay hôm nay. Không cần credit card.
    </p>
    <Button size="lg" asChild>
      <Link href="/register">
        Tạo thiệp miễn phí
        <ArrowRight className="w-5 h-5" />
      </Link>
    </Button>
  </div>
</section>
```

- [ ] **Step 9: Add Footer**

```typescript
// Footer
<footer className="py-16 px-6 bg-rose-900 text-white">
  <div className="max-w-7xl mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div>
        <h3 className="font-semibold mb-4">Product</h3>
        <ul className="space-y-2 text-rose-200">
          <li><Link href="/templates">Templates</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/features">Features</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Resources</h3>
        <ul className="space-y-2 text-rose-200">
          <li><Link href="/help">Help Center</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/guides">Guides</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Company</h3>
        <ul className="space-y-2 text-rose-200">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact">Contact</Link></li>
          <li><Link href="/careers">Careers</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-4">Legal</h3>
        <ul className="space-y-2 text-rose-200">
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-rose-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-rose-300 text-sm">© 2026 Wedding Invite. All rights reserved.</p>
      <div className="flex gap-4">
        <a href="#" aria-label="Facebook" className="text-rose-300 hover:text-white transition-colors">Facebook</a>
        <a href="#" aria-label="Instagram" className="text-rose-300 hover:text-white transition-colors">Instagram</a>
      </div>
    </div>
  </div>
</footer>
```

---

## Task 7: Add cn utility (clsx + tailwind-merge)

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utils file**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Verify installation**

Run: `ls src/lib/utils.ts && echo "created"`

Expected: `created`

---

## Task 8: Fix Button asChild Pattern

**Files:**
- Modify: `src/components/ui/button.tsx`

- [ ] **Step 1: Update button to support asChild**

```typescript
// src/components/ui/button.tsx (updated)
"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm",
  secondary: "bg-rose-100 text-rose-700 hover:bg-rose-200 active:bg-rose-300",
  ghost: "bg-transparent text-rose-700 hover:bg-rose-50 active:bg-rose-100",
  outline: "bg-transparent border border-rose-300 text-rose-700 hover:bg-rose-50 active:bg-rose-100",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-5 text-base rounded-xl",
  lg: "h-14 px-7 text-lg rounded-2xl font-semibold",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, children, asChild, href, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      variantStyles[variant],
      sizeStyles[size],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }

    if (asChild && typeof children === "object" && children !== null) {
      return <>{children}</>;
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

Note: For asChild pattern with Link, we'll simplify to just use href prop for link buttons, or render Link directly in page.

---

## Task 9: Build & Test

**Files:**
- Build and test

- [ ] **Step 1: Run lint**

Run: `pnpm lint`

Expected: No errors

- [ ] **Step 2: Run build**

Run: `pnpm build`

Expected: Build success

- [ ] **Step 3: Test in browser** (if dev server available)

Run: `pnpm dev` (in background)

Then verify:
- Landing page loads at `/`
- Hero section visible
- Trust strip metrics visible
- Template cards render
- FAQ accordion works
- Footer links present

---

## Task 10: Commit

**Files:**
- Commit all changes

- [ ] **Step 1: Stage and commit**

```bash
git add -A
git commit -m "feat: redesign landing page with premium romantic design

- Add Lucide React icons
- Create UI component library (button, badge, card, section-wrapper)
- Update layout with Google Fonts (Cormorant Infant, Plus Jakarta Sans, Great Vibes)
- Add landing page design tokens
- Build Hero section with gradient background
- Add Trust Strip with metrics
- Build Template Showcase with category filters
- Add How It Works 3-step section
- Add Feature Highlights 6-feature grid
- Add Social Proof counter section
- Add Testimonials carousel
- Add FAQ accordion
- Add Final CTA section
- Add Footer with links

Design: Conversion-first Premium, Soft UI Evolution style
Brand: Elegant luxury + warm romantic"
```

---

## Implementation Order

1. Task 1: Add dependencies (Lucide, clsx, tailwind-merge)
2. Task 7: Create utils.ts
3. Task 2: Create UI component library
4. Task 3: Update layout with fonts
5. Task 4: Update globals.css with tokens
6. Task 5-6: Build landing page sections
7. Task 8: Fix button pattern
8. Task 9: Build & test
9. Task 10: Commit

---

## Verification Checklist

- [ ] No emojis used as icons (Lucide throughout)
- [ ] All interactive elements have cursor-pointer + hover/press feedback
- [ ] Mobile-first responsive design
- [ ] prefers-reduced-motion support
- [ ] Color contrast ≥4.5:1 (AA)
- [ ] Focus rings visible on interactive elements
- [ ] Semantic HTML (header, nav, section, main, footer)
- [ ] No hardcoded hex values — use design tokens
- [ ] All buttons have text labels (no icon-only without aria-label)

---

*Last updated: 2026-05-17*