# Design System: Editorial Heritage

## 1. Overview & Creative North Star
**The Creative North Star: "The Curated Manuscript"**

This design system is not a template; it is a digital translation of a high-end concierge experience. It rejects the "boxy" nature of standard web design in favor of an editorial, asymmetric layout that mimics a luxury coffee-table book. We move beyond "Trustworthy" and "Modern" into the realm of **Atmospheric Authority**.

To break the "standard" feel, we employ **Intentional Asymmetry**: large Display typography will often overlap container boundaries, and imagery will utilize varying aspect ratios (from 4:5 portraits to 21:9 cinematic spans). The goal is to make the user feel they are turning the pages of a curated heritage journal, where white space (Cream `#fbf9f5`) is as much a design element as the content itself.

---

## 2. Colors: The Majestic Heritage Palette
The palette is built on high-contrast sophistication. We use Deep Navy to anchor the experience, Gold to highlight craftsmanship, and Cream to provide a warm, breathable canvas.

### The "No-Line" Rule
**Borders are forbidden for sectioning.** To separate a "Room Suites" section from a "Dining" section, you must shift the background from `surface` (#fbf9f5) to `surface-container-low` (#f5f3ef). Define boundaries through tonal weight, never through 1px strokes.

### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine stationery.
*   **Base:** `surface` (#fbf9f5)
*   **Nested Content:** Use `surface-container-lowest` (#ffffff) for cards to create a subtle "lift" against the cream background.
*   **Overlays:** Use `surface-container-highest` (#e4e2de) for utility bars or secondary navigation to ground the eye.

### The "Glass & Gold" Rule
For floating navigation or mobile menus, utilize **Glassmorphism**. Apply `surface` at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Texture:** Main CTAs should not be flat. Apply a subtle linear gradient (135°) from `secondary` (#775a19) to `on-secondary-container` (#785a19) to give the Gold a metallic, "foiled" depth.

---

## 3. Typography: The Bilingual Prestige
The system utilizes a high-contrast scale to create an editorial hierarchy. Both fonts are selected for their impeccable support of Vietnamese diacritics.

*   **Display & Headlines (Montserrat):** Our "Voice." It should be used sparingly but boldly. Use `display-lg` for hero titles, often with negative letter-spacing (-0.02em) to increase the "fashion-mag" feel.
*   **Body & Titles (Be Vietnam Pro):** Our "Service." A clean, modern sans-serif that ensures legibility. Vietnamese characters remain balanced and elegant even at the `body-sm` level.
*   **The Signature Lockup:** Always pair a `label-md` (All Caps, tracked out +10%) in Gold above a `headline-lg` in Deep Navy. This "Category > Title" pairing is the hallmark of the SK Boutique brand.

---

## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to show importance; we use light.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The slight shift in hex value creates a "soft lift" that feels architectural rather than digital.
*   **Ambient Shadows:** If a card must float (e.g., a booking modal), use an ultra-diffused shadow:
    *   `box-shadow: 0 20px 40px rgba(0, 12, 30, 0.06);`
    *   *Note: The shadow uses a tint of our Deep Navy (#000c1e), not pure black.*
*   **The "Ghost Border":** If a button or input requires a boundary for accessibility, use `outline-variant` (#c5c6cd) at 20% opacity. It should be felt, not seen.

---

## 5. Components: Style Guidelines

### Buttons (The "Seal of Quality")
*   **Primary:** Deep Navy background, Cream text. No border. `md` (0.375rem) roundedness.
*   **Secondary (Gold Foil):** A gradient of Gold (#775a19 to #785a19). Use for "Book Now" or high-conversion actions.
*   **Tertiary:** Text-only in Gold, with a 1px "Ghost Border" underline that expands on hover.

### Cards & Lists
*   **Forbid Dividers:** Do not use lines to separate list items. Use `24px` of vertical white space or alternating backgrounds of `surface` and `surface-low`.
*   **Imagery:** All cards must feature a `0.25rem` (sm) corner radius. This prevents the design from feeling too sharp/aggressive while maintaining a modern edge.

### Input Fields
*   **Luxury Minimalist:** Fields should have no background. Only a bottom border of `outline-variant` at 40% opacity. On focus, the border transitions to `secondary` (Gold).

### Signature Component: The "Heritage Overlay"
A specialized component for SK Boutique: A large-scale image (4:5 ratio) with a `surface-container-lowest` text box that overlaps the bottom-right corner by 15%. This intentional break of the grid creates the "Editorial" look.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Whitespace:** If a section feels crowded, double the padding. Luxury is the luxury of space.
*   **Use Intentional Cropping:** Let images of the hotel interiors bleed off the edge of the screen to suggest a world beyond the frame.
*   **Bilingual Balance:** Ensure the `line-height` for Vietnamese text is 1.6x for body copy to accommodate diacritics without looking cramped.

### Don't:
*   **No Pure Black:** Never use `#000000`. Use Deep Navy (#000c1e) for shadows and text to maintain "Majestic Heritage" tonal depth.
*   **No Sharp Corners:** Avoid `0px` radius; use the `sm` (0.25rem) or `md` (0.375rem) tokens to soften the digital experience.
*   **No Heavy Borders:** If you see a solid line, delete it. Ask: "Can I define this space with a subtle background shift instead?"