# Design System Specification: The Clinical Ledger

This design system is built to transform the sterile nature of healthcare data into a sophisticated, editorial experience. We are moving away from the "generic dashboard" aesthetic and toward a "Clinical Ledger"—a high-trust environment where precision meets premium digital craftsmanship. This system prioritizes legibility, tonal depth, and intentional layering over traditional UI borders.

---

## 1. Overview & Creative North Star: "The Clinical Ledger"

The Creative North Star for this design system is **The Clinical Ledger**. 

In high-stakes healthcare coordination, trust is not built with shadows and boxes; it is built with clarity, intentionality, and breathing room. We break the "template" look by using **Asymmetric Composition** and **Tonal Layering**. Instead of boxing data into rigid containers, we use white space and varying surface tones to curate the user’s eye. This creates a "Glass and Paper" feel—where information feels physically layered rather than digitally pasted.

---

## 2. Color & Tonal Architecture

This palette is rooted in medical authority. We use "Trustworthy Blues" and "Clinical Whites" to maintain a professional atmosphere, while utilizing status indicators for immediate clinical triage.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section off the UI. 
Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` sidebar sitting against a `surface` background creates a clear, sophisticated boundary without the visual noise of a line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the `surface-container` tiers to create "nested" depth:
- **Level 0 (Base):** `surface` (#f7f9fb)
- **Level 1 (Sections):** `surface-container-low` (#f2f4f6)
- **Level 2 (Interactive Cards):** `surface-container-lowest` (#ffffff)
- **Level 3 (Floating Elements):** `surface-container-high` (#e6e8ea)

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating overlays (e.g., fly-out patient profiles). Use a semi-transparent `surface_container_lowest` with a `backdrop-blur` of 20px. 
**Signature Texture:** Primary action buttons should not be flat. Apply a subtle linear gradient from `primary` (#00478d) to `primary_container` (#005eb8) at a 135-degree angle to provide a "jeweled" polish.

---

## 3. Typography

The typography strategy pairs the structural authority of **Manrope** for headers with the Swiss-style utility of **Inter** for data.

- **Display & Headlines (Manrope):** These are your "Editorial Anchors." Use `display-md` (2.75rem) for high-level patient stats to create a sense of importance.
- **Title & Body (Inter):** Inter is the workhorse. Use `title-sm` (1rem) for card headers and `body-md` (0.875rem) for clinical notes. 
- **Labels (Inter):** For data-dense tables, use `label-md` (0.75rem). The goal is "legibility through scale"—using smaller, well-spaced text rather than large, cramped text.

---

## 4. Elevation & Depth (Tonal Physics)

Hierarchy is achieved through **Tonal Stacking**, not structural lines.

- **The Layering Principle:** Place a `surface-container-lowest` card on top of a `surface-container-low` background. This creates a soft, natural lift that feels like fine stationery.
- **Ambient Shadows:** Shadows are reserved for floating elements only (Modals, Popovers). Use an extra-diffused shadow: `blur: 40px`, `y: 12px`, with an opacity of 6% using the `on-surface` color (#191c1e). Never use pure black for shadows.
- **The "Ghost Border" Fallback:** If a divider is absolutely necessary for accessibility in a dense table, use a "Ghost Border": the `outline_variant` (#c2c6d4) at **15% opacity**.

---

## 5. Components

### Action Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. Use `rounded-md` (0.375rem).
- **Secondary:** `surface-container-highest` background with `on_secondary_container` text.
- **Tertiary:** No background. Use `primary` text.

### High-Density Patient Tables
- **Rule:** Forbid the use of vertical or horizontal divider lines.
- **Separation:** Use a subtle background shift (`surface-container-low`) on hover.
- **Spacing:** Use `spacing-3` (0.6rem) for cell padding to maintain density without sacrificing touch targets.

### Structured Patient Cards
- **Construction:** Use `surface-container-lowest` with `rounded-lg` (0.5rem). 
- **Header:** Use a `primary_fixed` (#d6e3ff) background strip at the top for the patient’s name to anchor the card visually.
- **Data Points:** Use `label-sm` for captions and `body-md` for the values.

### Status Indicators (Triage Chips)
- **High Risk:** `error` (#ba1a1a) text on `error_container` (#ffdad6) background.
- **Monitoring:** `tertiary` (#793100) text on `tertiary_fixed` (#ffdbcb) background.
- **Stable:** A custom green (suggested: #2e7d32) on a soft mint container.
- **Shape:** Use `rounded-full` (9999px) for these indicators to differentiate them from square-ish data cards.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-10` (2.25rem) between major sections to allow the clinical data to "breathe."
- **Do** use `on_surface_variant` (#424752) for secondary metadata to create a clear visual hierarchy.
- **Do** use asymmetric layouts (e.g., a wide main column for charts and a narrow side column for patient alerts).

### Don'ts
- **Don't** use 1px solid black or grey borders. They clutter the clinical view.
- **Don't** use high-contrast shadows. They feel "cheap" and break the "Clinical Ledger" aesthetic.
- **Don't** use the `primary` color for everything. Reserve it for "Primary Intent" actions to maintain its psychological weight.