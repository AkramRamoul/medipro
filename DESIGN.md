# High-End Editorial Design System: The Clinical Precision Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Clinical Sanctuary"**
In a medical environment, cognitive load is the enemy. This design system moves beyond the generic "SaaS dashboard" by adopting an editorial, high-end aesthetic that prioritizes serenity, authority, and breathability. We reject the "boxed-in" look of traditional software. Instead, we utilize **Intentional Asymmetry** and **Tonal Layering** to guide the eye. By treating the interface as a series of sophisticated, stacked surfaces rather than a flat grid, we create a sense of architectural depth that feels premium and calm.

## 2. Colors & Surface Philosophy
The palette is rooted in clinical purity but elevated through tonal shifts rather than structural lines.

### The "No-Line" Rule
**Strict Mandate:** 1px solid borders for sectioning are prohibited. Boundaries between navigation, headers, and content areas must be defined solely through background color shifts. 
*   *Example:* A `surface-container-low` sidebar sitting against a `surface` main content area.

### Surface Hierarchy & Nesting
We treat the UI as physical layers of "Medical Grade Glass." Use the following hierarchy to create depth:
*   **Base Layer:** `surface` (#faf9f9) - The "desk" everything sits on.
*   **Section Layer:** `surface-container-low` (#f4f3f3) - Defining large content regions.
*   **Component Layer:** `surface-container-lowest` (#ffffff) - Cards and interactive elements that need to "pop."
*   **Overlay Layer:** `surface-bright` with 80% opacity + `backdrop-blur(12px)` - For Modals and floating menus.

### The "Glass & Gradient" Rule
To prevent a sterile, "dead" feel, primary actions (CTAs) should utilize a subtle linear gradient: `primary` (#0061a4) to `primary_container` (#2196f3) at a 135-degree angle. This adds a "jewel-like" finish to critical medical actions.

---

## 3. Typography: Authority Through Scale
We pair the technical precision of **Inter** with the editorial elegance of **Manrope**.

| Role | Font Family | Size | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | 700 | Large data highlights (e.g., Total Patients) |
| **Headline-MD** | Manrope | 1.75rem | 600 | Page titles and high-level section headers |
| **Title-LG** | Inter | 1.375rem | 600 | Card titles, Modal headers |
| **Body-MD** | Inter | 0.875rem | 400 | Patient records, notes, and general data |
| **Label-MD** | Inter | 0.75rem | 500 | Metadata, table headers (All Caps, 0.05em tracking) |

*Director’s Note: Use `display-sm` for hero metrics. The juxtaposition of a large Manrope number next to a small Inter label creates an immediate "Premium Analytics" feel.*

---

## 4. Elevation & Depth
Traditional drop shadows look "dirty" in a medical context. We use **Tonal Stacking** and **Ambient Glows**.

*   **The Layering Principle:** To lift a card, do not add a shadow. Instead, place a `surface-container-lowest` card on top of a `surface-container-low` background. The contrast in brightness creates the lift.
*   **Ambient Shadows:** For floating elements (Modals, Popovers), use a tinted shadow: `0px 12px 32px rgba(0, 97, 164, 0.06)`. This subtle blue tint mimics light passing through clinical glass.
*   **The "Ghost Border" Fallback:** If high-density data requires separation, use `outline_variant` (#bfc7d4) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Navigation sidebars should use `surface` at 90% opacity with a heavy blur. This allows the subtle colors of the dashboard to bleed through, making the app feel like a single, cohesive organism.

---

## 5. Components & Interaction Patterns

### Sidebar Navigation
*   **Style:** No background color for the container. Use active state indicators that are floating "pills" using `primary_fixed` (#d1e4ff). 
*   **Spacing:** Use `spacing-6` (2rem) padding for the container to ensure the brand logo has "room to breathe."

### Cards & Data Tables
*   **Cards:** Use `roundedness-lg` (1rem). No borders. Separation is achieved via `surface-container-lowest`.
*   **Data Tables:** Forbid the use of divider lines. Separate rows using `spacing-3` vertical white space. On hover, transition the row background to `secondary_container` at 30% opacity.
*   **The "Patient Vital" Component:** A specialized card using a soft gradient background (`tertiary_fixed` to `surface`) to highlight critical patient data.

### Buttons & Inputs
*   **Primary Button:** `roundedness-full` (9999px) to contrast with the `lg` corners of cards. This makes "Action" feel distinct from "Content."
*   **Input Fields:** Use `surface-container-high` as the fill color. On focus, transition to an `outline` of `primary` with a 4px "soft glow" (0.15 opacity primary).

---

## 6. Do’s and Don’ts

### Do
*   **DO** use asymmetric layouts. If a table is on the left, use a narrower "Insight" card on the right to break the grid.
*   **DO** use "Medical Blue" (#2196F3) sparingly. It is a signal, not a decoration.
*   **DO** lean on the `spacing-12` and `spacing-16` tokens for page margins. Luxury is defined by wasted space.

### Don't
*   **DON'T** use black text (#000000). Always use `on_surface` (#1a1c1c) to maintain a soft, high-end optical balance.
*   **DON'T** use icons with varying stroke weights. Use a consistent 1.5px or 2px "Clinical" icon set (rounded terminals).
*   **DON'T** use 100% opacity backgrounds for modals. Use the Glassmorphism rule to maintain spatial awareness for the doctor.

### Dark Mode Note
In Dark Mode, the hierarchy inverts. The `surface` becomes the darkest point, and `surface-container-highest` becomes the lightest "interactive" surface. Maintain the blue tint in shadows to prevent the UI from feeling "flat-black."