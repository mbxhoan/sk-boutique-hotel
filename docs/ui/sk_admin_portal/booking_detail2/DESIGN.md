---
name: SK Boutique Hotel Admin
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#4e453a'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#807569'
  outline-variant: '#d1c5b6'
  surface-tint: '#775928'
  primary: '#775928'
  on-primary: '#ffffff'
  primary-container: '#b08d57'
  on-primary-container: '#3d2700'
  inverse-primary: '#e8c086'
  secondary: '#4a607c'
  on-secondary: '#ffffff'
  secondary-container: '#c5dcfd'
  on-secondary-container: '#4b617d'
  tertiary: '#5c5f60'
  on-tertiary: '#ffffff'
  tertiary-container: '#919394'
  on-tertiary-container: '#292c2d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdeae'
  primary-fixed-dim: '#e8c086'
  on-primary-fixed: '#281800'
  on-primary-fixed-variant: '#5d4213'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#b1c8e9'
  on-secondary-fixed: '#021c36'
  on-secondary-fixed-variant: '#324863'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#454748'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  sidebar-width: 260px
---

## Brand & Style

The design system is engineered to evoke a sense of quiet luxury, precision, and operational excellence. It targets hospitality professionals who require high-density information without cognitive overload.

The design style is **Corporate / Modern** with a strong leaning toward **Minimalism**. It prioritizes clarity through generous white space in content areas, contrasted against a high-authority sidebar. The aesthetic is "Invisible UI"—where the interface recedes to let the data and guest information take center stage, punctuated only by refined gold accents to signal importance and primary interactions.

## Colors

The palette is anchored by the interplay between **Sophisticated Dark Navy** and **Refined Gold**. 

- **Primary Gold (#B08D57):** Reserved exclusively for primary call-to-actions, active states, and critical highlights. It represents the premium nature of the boutique brand.
- **Secondary Navy (#001A33):** Used for the global navigation sidebar to provide a strong structural frame and an immediate sense of institutional stability.
- **Neutral Grays:** A scale of cool grays is used for typography, borders, and secondary icons to maintain a crisp, clean environment.
- **Semantic Colors:** Success, Warning, and Error states use muted but clear tones to ensure they integrate into the sophisticated environment without appearing jarring.

## Typography

This design system utilizes **Inter** for its exceptional legibility in high-density data environments. The typographic hierarchy is disciplined, favoring subtle weight changes over dramatic size increases. 

- **Headlines:** Set in semi-bold with slight negative letter-spacing for a modern, compact look.
- **Body Text:** Optimized at 14px for standard reading and 13px for dense data views.
- **Labels:** Small, uppercase labels with increased tracking are used for section headers and table column titles to provide clear categorization without adding visual weight.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The sidebar remains fixed at 260px, while the main content area utilizes a fluid 12-column grid to maximize the utility of wide-screen monitors common in hotel administrative offices.

A 4px baseline grid ensures vertical rhythm. High-density views (like the room availability grid) utilize the `sm` (8px) spacing unit, while general settings and dashboard cards use `md` (16px) or `lg` (24px) padding to maintain an airy, premium feel.

## Elevation & Depth

To maintain a minimalist aesthetic, depth is conveyed through **Low-contrast Outlines** and **Ambient Shadows**. 

- **Level 0 (Flat):** The main content background.
- **Level 1 (Subtle):** Cards and data tables use a 1px border (#E2E8F0) and a very soft, diffused shadow (0px 2px 4px rgba(0, 0, 0, 0.05)).
- **Level 2 (Raised):** Hover states on interactive rows and dropdown menus use a slightly more pronounced shadow (0px 4px 12px rgba(0, 0, 0, 0.08)) to indicate interactivity.
- **Sidebar:** Uses a solid color fill with no shadow, relying on color contrast to define its boundary.

## Shapes

The design system adopts a **Soft** shape language. Elements like buttons and input fields use a 4px (0.25rem) corner radius. This provides a professional, geometric feel that isn't as aggressive as sharp corners, nor as casual as fully rounded elements. Larger containers like cards use an 8px (0.5rem) radius to soften the overall appearance of the dashboard.

## Components

### Primary Actions
Buttons are designed with high contrast. The primary button uses the **Refined Gold** background with white text. Secondary buttons use a transparent background with a navy border and navy text.

### High-Density Data Tables
Tables are the core of this system. They feature 40px row heights, subtle hover states in light gray, and "Sticky" headers. Alignment is strict: text is left-aligned, monetary values are right-aligned, and status badges are centered.

### Status Badges
Badges use a "soft-pill" style with a low-opacity background of the semantic color and a high-opacity text of the same hue (e.g., a "Checked In" badge has a pale green background with dark green text).

### Filter Bars
Located directly above data tables, these use a compact, horizontal layout with inline search fields and select-menus. They are visually separated by a 1px bottom border.

### Input Fields
Inputs are minimalist, featuring a 1px light gray border that transitions to Navy on focus. Labels are always positioned above the input field in `label-caps` typography.

### Additional Components
- **Date Range Picker:** Custom-styled for booking management, using Gold for the selected range.
- **Stat Cards:** Simple, border-only cards displaying key metrics (e.g., Occupancy Rate) with large-format numerals.