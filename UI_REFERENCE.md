# UI Design Reference
## Smart Invoice Manager

This is the single source of truth for visual design across the app. All frontend work should follow this document for consistency.

**Theme:** Light UI with black/red/gray accents (bold, modern, business-appropriate). Red is reserved exclusively for danger/overdue states — it is never used for primary branding/actions, to avoid confusing "click this" with "this is a problem."

---

### 1. Color Palette

| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#FFFFFF` | Page background |
| `bg-secondary` | `#F5F5F5` | Cards, table stripes, sidebar |
| `border` | `#E0E0E0` | Dividers, input borders, table borders |
| `text-primary` | `#0D0D0D` | Headings, body text |
| `text-secondary` | `#6B6B6B` | Labels, helper text, muted info |
| `brand-primary` | `#0D0D0D` | Primary buttons, active nav item, links, focus rings |
| `brand-primary-hover` | `#2B2B2B` | Hover state for primary buttons |
| `danger` / `overdue` | `#E5192E` | Overdue badge, error messages, destructive actions (delete) |
| `danger-bg` | `#FDECEE` | Background tint for overdue rows/badges |
| `success` / `paid` | `#1E8E3E` | Paid badge |
| `success-bg` | `#E9F7EC` | Background tint for paid badges |
| `warning` / `partial` | `#D97706` | Partially Paid badge |
| `warning-bg` | `#FEF3E2` | Background tint for partially-paid badges |
| `neutral` / `unpaid` | `#6B6B6B` | Unpaid badge |
| `neutral-bg` | `#EFEFEF` | Background tint for unpaid badges |

**Rule:** Overdue (red) always takes visual priority over the underlying status. An unpaid invoice past due date shows the **red Overdue badge**, not the gray Unpaid badge.

---

### 2. Typography

| Token | Font / Size / Weight | Usage |
|---|---|---|
| Font family | `Inter, system-ui, sans-serif` | All text |
| `text-h1` | 28px / 700 | Page titles ("Invoices", "Dashboard") |
| `text-h2` | 20px / 600 | Section headings, card titles |
| `text-h3` | 16px / 600 | Table headers, form section labels |
| `text-body` | 14px / 400 | Default body text |
| `text-small` | 12px / 400 | Helper text, timestamps |
| `text-mono` | 14px / 500, monospace | Invoice numbers, amounts (for alignment/scannability) |

---

### 3. Spacing Scale

`4px, 8px, 12px, 16px, 24px, 32px, 48px` — use multiples of 4px throughout. Page padding: `24px` (desktop), `16px` (mobile).

---

### 4. Component Patterns

#### Buttons
| Variant | Style |
|---|---|
| Primary | `bg-brand-primary`, white text, 8px radius — e.g. "Save Invoice", "Add Vendor" |
| Secondary | White bg, `border` outline, `text-primary` — e.g. "Cancel" |
| Destructive | `danger` text/border, white bg (or filled `danger` on confirm dialogs) — e.g. "Delete" |
| Disabled | `neutral-bg`, `text-secondary`, no pointer events |

#### Status Badges
Pill-shaped, colored background (`*-bg` token) + colored text (`*` token), 12px text, e.g.:
- 🟢 `Paid` — success
- 🟠 `Partially Paid` — warning
- ⚪ `Unpaid` — neutral
- 🔴 `Overdue` — danger (overrides above when applicable)

#### Cards
White background, `border` 1px, 8px radius, 16–24px padding. Used for dashboard stat cards, form sections.

#### Tables (Invoice List)
- Header row: `bg-secondary`, `text-h3`, sticky on scroll
- Row hover: `bg-secondary`
- Overdue rows: subtle `danger-bg` left border accent (4px) — draws attention without overwhelming the row
- Amount columns: right-aligned, `text-mono`

#### Forms (Add/Edit Invoice)
- Label above input, `text-h3` style, `text-secondary`
- Input: white bg, `border`, 6px radius, 10px vertical padding
- Focus state: 2px `brand-primary` ring
- Validation error: red text below field + red border on input
- Line items: repeatable row group with an inline "+ Add Line Item" (secondary button) and a subtotal column that updates live

#### Dashboard Stat Cards
Large number (`text-h1`, `text-mono`) + small label (`text-small`, `text-secondary`) below. Overdue-related cards get a `danger` accent border-top (4px).

---

### 5. Screen Layouts

#### Vendor List
```
┌─────────────────────────────────────────────┐
│  Vendors                        [+ Add Vendor]│
├─────────────────────────────────────────────┤
│  Name          Email            Phone         │
│  ─────────────────────────────────────────── │
│  Acme Corp     acme@x.com       +91...        │
│  Beta Ltd      beta@x.com       +91...        │
└─────────────────────────────────────────────┘
```

#### Invoice List
```
┌───────────────────────────────────────────────────────────┐
│  Invoices                              [+ Create Invoice]   │
│  [Vendor ▾] [Status ▾] [Overdue only ☐] [Date range]  [Search] │
├───────────────────────────────────────────────────────────┤
│  Vendor    Invoice #   Date       Due       Total    Status │
│  ──────────────────────────────────────────────────────────│
│▌ Acme Corp INV-1001    01-Sep-26  10-Sep-26 ₹12,400  🔴Overdue│
│  Beta Ltd  INV-2002    15-Sep-26  30-Sep-26 ₹8,200   🟢Paid  │
└───────────────────────────────────────────────────────────┘
```
(▌ = red left-border accent on overdue rows)

#### Add/Edit Invoice
```
┌─────────────────────────────────────────────┐
│  New Invoice            [Extract from Text/Image/PDF] │
│  Vendor        [Select vendor ▾]              │
│  Invoice #     [____________]                 │
│  Invoice Date  [____]   Due Date [____]        │
│  ─────────────────── Line Items ───────────── │
│  Description   Qty   Unit Price   Subtotal     │
│  [_________]   [__]  [________]   ₹0.00   [x]  │
│  [+ Add Line Item]                             │
│  Tax           [____]                          │
│  Total Amount            ₹0.00 (auto)          │
│                        [Cancel] [Save Invoice]  │
└─────────────────────────────────────────────┘
```

#### Invoice Details
```
┌─────────────────────────────────────────────┐
│  INV-1001               🔴 Overdue            │
│  Vendor: Acme Corp                            │
│  Invoice Date: 01-Sep-26   Due: 10-Sep-26     │
│  ─────────────── Line Items ───────────────── │
│  Description      Qty   Unit Price   Subtotal │
│  Web Hosting       1     ₹10,000     ₹10,000  │
│  Tax: ₹2,400                                  │
│  Total: ₹12,400                               │
│  Payment Status: [Unpaid ▾]   Amount Paid: [__]│
└─────────────────────────────────────────────┘
```

#### Dashboard
```
┌─────────────────────────────────────────────┐
│  Dashboard                                    │
│  ┌──────────┐┌──────────┐┌──────────┐         │
│  │Outstanding││ Overdue  ││ Overdue  │         │
│  │ ₹45,200  ││ ₹12,400  ││   3      │         │
│  └──────────┘└──────────┘└──────────┘         │
│  [Status Breakdown Chart]  [Spend by Vendor]   │
│  Recent Invoices: ...                          │
└─────────────────────────────────────────────┘
```

#### AI Extraction/Review
```
┌─────────────────────────────────────────────┐
│  Extract Invoice           [Upload / Paste text]│
│  ── Review extracted data before saving ──    │
│  Vendor        [Acme Corp ▾]  (AI-suggested)  │
│  Invoice #     [INV-1001]                     │
│  Invoice Date  [01-Sep-26]  Due [10-Sep-26]    │
│  Line items (editable, same as manual form)    │
│                    [Discard]  [Confirm & Save] │
└─────────────────────────────────────────────┘
```

---

### 6. Icons & Imagery
Use a single consistent icon set (recommend **Lucide** for React — clean, matches sharp/bold aesthetic). No decorative imagery needed; this is a data-dense business tool — prioritize clarity over ornamentation.

---

### 7. Responsive Notes
Desktop-first (this is a business tool, primarily used on laptop/desktop during the demo). Tables scroll horizontally on narrow widths rather than collapsing into cards, to keep the hackathon build scope tight.
