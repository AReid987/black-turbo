# System Architecture: BLACKTIVISM Rebranding & Aigency Styling

This document records the branding design decisions, typography rules, and theme config implemented in the application.

---

## 1. Branding: BLACKTIVISM OSINT

The application name has been updated to **BLACKTIVISM** across the primary user-facing touchpoints:
* **Tactical Display Header**: Displayed next to the secure connection indicator.
* **Tactical Display Footer Status Bar**: Shows `BLACKTIVISM v0.4`.
* **Sidebar Layer Panel Version Info**: Displays `BLACKTIVISM OSINT v0.4`.

The decoy front page (Spreadsheet Enthusiasts) is retained intact to preserve security masking.

---

## 2. Aigency Design System Integration

The frontend styling aligns with the spacecraft instrument panel guidelines.

### Color Theme Variables (OKLCH System)
* **Void Layer Surfaces (Hue 250)**:
  * `--aig-void-deep`: `oklch(0.10  0.015 250)` (Deep background void)
  * `--aig-void-base`: `oklch(0.13  0.015 250)` (Dashboard panel backgrounds)
  * `--aig-void-raised`: `oklch(0.17  0.015 250)` (Button/Control backgrounds)
  * `--aig-void-glass`: `oklch(0.20  0.020 250)` (Glass surface panels)
* **Warm Amber Accents (Hue 65)**:
  * `--aig-accent-warm`: `oklch(0.75  0.150  65)` (Primary highlights and borders)
  * `--aig-accent-warm-dim`: `oklch(0.55  0.100  65)` (Dimmed borders / disabled states)

### Visual Texture & Layout Rules
* **Bayer Matrix Dither**: Applied globally via `.glass-surface` on the dashboard container, rendering a pixelated SVG dither grid overlay.
* **Sharp Corners**: Banned `border-radius` (set to `0px`) on active spacecraft panel interfaces, including map controls, sidebar layers, and search bars.
* **Flat Surfaces**: Banned standard drop shadows inside glass layouts (retaining flat high-contrast edges).

### Typography Stack
* **Monospace Stack**: Banned sans/serif fonts in dashboard view. JetBrains Mono is the primary font.
* **Display/TTY Font Fallbacks**: VT323 and Share Tech Mono configured for display status indicators.
