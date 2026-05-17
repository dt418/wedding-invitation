# Design System - Legacy Content Site (Superseded)

> Status: Superseded by `docs/superpowers/specs/2026-05-17-wedding-redesign-design.md`.
> Kept for historical reference only.

## Mission

Deliver implementation-ready design-system guidance for Tạo Thiệp Cưới Online Miễn Phí Trong 10 Phút that can be applied consistently across content site interfaces.

## Context and Goals

**Design intent:** Hệ thống UI **must** giúp người đọc tìm, hiểu, và hành động (tạo thiệp) nhanh trong trải nghiệm content-first, nhất quán, dễ triển khai.  
Mục tiêu: chuẩn hóa rules cho content site với mật độ cao (buttons 63, links 62, cards 38, lists 13, navigation 1), đạt WCAG 2.2 AA, giảm sai lệch khi build.

---

## Brand

- **Product/brand:** Tạo Thiệp Cưới Online Miễn Phí Trong 10 Phút
- **URL:** https://chungdoi.com/
- **Audience:** readers and knowledge seekers
- **Product surface:** content site

---

## Style Foundations

### Typography

- `font.family.primary` = `ui-sans-serif`
- `font.family.stack` = `ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji`
- `font.size.base` = 16px
- `font.weight.base` = 300
- `font.lineHeight.base` = 24px
- Scale: `xs=11px`, `sm=12px`, `md=14px`, `lg=16px`, `xl=18px`, `2xl=20px`, `3xl=30px`, `4xl=36px`

### Color Palette

| Token | Value |
|-------|-------|
| `color.text.primary` | `oklch(0.84955 0 0)` |
| `color.text.secondary` | `oklch(0.84955 0 0 / 0.7)` |
| `color.text.tertiary` | `#ffffff` |
| `color.text.inverse` | `oklch(0.999994 0.0000455677 0.0000200868 / 0.7)` |
| `color.surface.base` | `#000000` |
| `color.surface.muted` | `oklch(0.84955 0 0 / 0.2)` |
| `color.surface.raised` | `oklch(0.14 0.004 49.25)` |
| `color.surface.strong` | `oklch(0 0 0)` |

### Spacing Scale

`space.1=2px`, `space.2=4px`, `space.3=8px`, `space.4=12px`, `space.5=16px`, `space.6=20px`, `space.7=24px`, `space.8=28px`

### Radius

`radius.xs=6px`, `radius.sm=8px`, `radius.md=12px`, `radius.lg=16px`, `radius.xl=33554400px`

### Shadow

| Token | Value |
|-------|-------|
| `shadow.1` | `rgba(0,0,0,0.25) 0px 25px 50px -12px` |
| `shadow.2` | inset + elevation for raised surfaces |
| `shadow.3` | `rgba(0,0,0,0.1) 0px 10px 15px -3px, rgba(0,0,0,0.1) 0px 4px 6px -4px` |
| `shadow.4` | `rgba(0,0,0,0.1) 0px 1px 3px 0px, rgba(0,0,0,0.1) 0px 1px 2px -1px` |

### Motion

`motion.duration.instant=150ms`, `motion.duration.fast=200ms`, `motion.duration.normal=300ms`, `motion.duration.slow=500ms`

### Accessibility

- **Target:** WCAG 2.2 AA
- **Keyboard-first** interactions required.
- **Focus-visible** rules required.
- **Contrast** constraints required.

### Writing Tone

concise, confident, implementation-focused

---

## Design Tokens and Foundations

### Semantic Token Contract

Team **must** dùng semantic tokens, không dùng raw color/size trực tiếp trong component.

**Typography**
- `font.family.primary`, `font.family.stack` **must** là mặc định cho toàn site.
- Body text **must** dùng `font.size.base=16px`, `font.weight.base=300`, `font.lineHeight.base=24px`.
- Scale **must** map đúng: `xs/sm/md/lg/xl/2xl/3xl/4xl`.

**Color**
- Text layers **must** map: primary → `color.text.primary`, secondary → `color.text.secondary`, tertiary/inverse theo semantic usage.
- Surfaces **must** map: page base → `color.surface.base`, muted/raised/strong theo hierarchy.
- Contrast **must** pass WCAG 2.2 AA ở mọi state.

**Spacing**
- Layout/component spacing **must** dùng `space.1..space.8`.
- Team **must not** tạo spacing lẻ ngoài scale.

**Radius / Shadow / Motion**
- Radius **must** dùng `radius.xs..xl`.
- Elevation **must** dùng `shadow.1..4` theo cấp.
- Transition **must** dùng `motion.duration.instant|fast|normal|slow`.

### Foundation Rules

- Visual hierarchy **must** ưu tiên readability trước decoration.
- Teams **should** ưu tiên consistency hệ thống hơn local exception.
- Mỗi section **must** có max-width, gutters, vertical rhythm theo token.
- Responsive breakpoints **must** nhất quán giữa page templates.

---

## Component-Level Rules

### A. Button (density high: 63)

**Anatomy**
- Container + label + optional leading/trailing icon + loading indicator.
- Min touch target **must** >= 44x44 px.

**Variants**
- Primary / Secondary / Ghost / Destructive.
- Size **must** map tokenized height/padding/text (sm/md/lg).

**State Rules (7 states required)**
- default, hover, focus-visible, active, disabled, loading, error
- Focus-visible **must** luôn thấy rõ (ring + contrast pass).
- Disabled **must** không click được, có visual de-emphasis.
- Loading **must** khóa double submit, giữ width ổn định.
- Error state **must** có semantic destructive style + helper text nếu cần.

**Interaction**
- Keyboard: `Tab` focus, `Enter/Space` activate **must** hoạt động.
- Pointer: hover/active feedback **must** trong `motion.duration.fast|normal`.
- Touch: feedback press **must** rõ, không lệ thuộc hover.

**Responsive / Edge Cases**
- Label dài **must** wrap hoặc truncate có tooltip theo context.
- Icon-only button **must** có `aria-label`.

---

### B. Link (density high: 62)

**State Rules (7 states required)**
- default, hover, focus-visible, active, disabled, loading, error

**Rules**
- Link **must** phân biệt rõ với text thường (style + focus-visible).
- External link **should** có icon/sr-only hint.
- Long URL/text **must** wrap an toàn, không phá layout.
- Keyboard activation **must** chuẩn Enter.

---

### C. Card (density high: 38)

**Anatomy**
- Card container, header, body, footer/actions.
- Elevation **must** dùng semantic shadows; spacing nội bộ **must** theo scale.

**State Rules (7 states required for clickable cards)**

**Responsive**
- Grid cards **must** auto-fit, không horizontal scroll.
- Content overflow **must** xử lý bằng clamp/truncate có fallback.

**Empty & Long Content**
- Empty card **must** có title + mô tả + CTA.
- Long metadata **must** ưu tiên wrap readable hơn cắt mù nghĩa.

---

### D. Lists (density: 13)

**Rules**
- List item **must** có cấu trúc: primary text, secondary meta, optional action.
- Interactive rows **must** có full state rules + focus-visible.
- Infinite/long lists **should** có loading skeleton + empty + error row states.

---

### E. Navigation (density: 1)

**Rules**
- Global nav **must** có vị trí ổn định, active state rõ.
- Mobile nav **must** hỗ trợ touch + keyboard + screen reader.
- Focus order **must** logic: logo → primary links → utilities.
- Overflow nav **must** dùng menu rõ nhãn, không icon mơ hồ.

---

### F. Form Controls (critical for "10 phút" flow)

**Rules**
- Mỗi control **must** có label rõ, helper text khi cần.
- States **must** đủ 7 trạng thái bắt buộc.
- Error **must** đặt gần field, chỉ cách sửa.
- Validation **should** ưu tiên inline-on-blur, không spam khi đang gõ.
- Autofill/long input **must** không phá layout.

---

## Accessibility Requirements and Testable Acceptance Criteria

### Keyboard-First
1. **Must pass:** Toàn bộ interactive elements reachable bằng Tab theo thứ tự logic.  
   **Fail:** Có element không thể focus hoặc focus "nhảy".
2. **Must pass:** Enter/Space kích hoạt đúng control role.  
   **Fail:** Chỉ click chuột mới hoạt động.

### Focus-Visible
3. **Must pass:** Mọi interactive state focus-visible có indicator rõ trên mọi background.  
   **Fail:** Focus ring bị ẩn hoặc contrast thấp.

### Contrast
4. **Must pass:** Text/body contrast đạt AA; UI boundaries/icons quan trọng đủ tương phản.  
   **Fail:** text secondary chìm, nút disabled không phân biệt được.

### Screen Reader Semantics
5. **Must pass:** Icon-only action có `aria-label`; form inputs có label programmatic.  
   **Fail:** Screen reader đọc "button" không nghĩa.

### State Communication
6. **Must pass:** Loading, error, disabled đều có semantic + visual distinction rõ.  
   **Fail:** User không biết hệ thống đang xử lý hay lỗi.

### Motion and Comfort
7. **Must pass:** Transition dùng tokenized duration, không gây disorientation.  
   **Fail:** animation quá dài/giật hoặc phá khả năng đọc.

---

## Content and Tone Standards

### Tone
- Copy **must** concise, confident, implementation-focused.
- CTA labels **must** mô tả hành động cụ thể, không mơ hồ.

### Standards
- Action labels **must** dùng động từ rõ: "Tạo thiệp", "Xem mẫu", "Lưu thay đổi".
- Error messages **must** nêu nguyên nhân + cách xử lý.
- Empty states **should** hướng người dùng đi tiếp.

### Examples
- Good CTA: "Tạo thiệp miễn phí trong 10 phút"
- Bad CTA: "Bấm vào đây"
- Good error: "Slug đã tồn tại. Hãy thử 'han-minh-2026'."
- Bad error: "Có lỗi xảy ra"

---

## Anti-Patterns and Prohibited Implementations

- Component **must not** dùng raw hex/px ngoài token contract.
- Focus indicator **must not** bị remove bằng `outline: none` không thay thế.
- UI **must not** dùng labels mơ hồ ("Submit", "Click here").
- Design **must not** thêm one-off spacing/typography exceptions.
- Cards/buttons **must not** đổi kích thước khi hover/active gây layout shift.
- Disabled controls **must not** giữ affordance như clickable.
- Link **must not** chỉ phân biệt bằng màu nếu contrast yếu.

### Migration Notes
- Legacy styles **should** map sang semantic tokens theo lớp:
  1. typography
  2. spacing
  3. color surface/text
  4. state styles
- Team **should** migrate theo component density trước: Button/Link/Card → Form → List/Nav.

---

## QA Checklist

- [ ] Mọi non-negotiable rules dùng "must"; recommendations dùng "should".
- [ ] 100% interactive components có đủ 7 trạng thái bắt buộc.
- [ ] Không còn raw hex/raw spacing trong component code.
- [ ] Keyboard navigation pass toàn site.
- [ ] Focus-visible pass toàn site, không hidden state.
- [ ] Contrast pass WCAG 2.2 AA cho text và control states.
- [ ] Form labels/errors/assistive text đầy đủ, testable.
- [ ] Long-content, overflow, empty/error/loading states đã định nghĩa.
- [ ] Responsive behavior không tạo horizontal scroll ngoài chủ đích.
- [ ] Component output giữ consistency toàn content site, không local visual exceptions.