# Frontend Architecture

A deep dive into the UI layer — the decoy landing page, the tactical dashboard, map rendering engine, component hierarchy, and the Aigency design system.

---

## Component Tree

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph TD
    subgraph Root["Next.js App Router"]
        LAYOUT["layout.tsx<br>Root Layout<br>JetBrains Mono + VT323 fonts<br>globals.css"]
    end

    subgraph Decoy["/ — Decoy Route"]
        PAGE_ROOT["page.tsx<br>→ DecoyLanding"]
        DL["DecoyLanding.tsx<br>Absurdist services marketplace<br>Konami + click triggers"]
        CL["CovertLogin.tsx<br>Renders HiddenAuth on trigger"]
        HA["HiddenAuth.tsx<br>Key input modal<br>POST /api/auth/validate"]
    end

    subgraph Dashboard["/ dashboard — Tactical Route"]
        PAGE_DASH["dashboard/page.tsx<br>Auth check on mount<br>Layer state + URL sync"]
        MAP["ShadowbrokerMap.tsx (dynamic, SSR=false)<br>53KB · MapLibre GL JS"]
        LP["LayerPanel.tsx<br>22 toggleable layers<br>Categorized + filterable"]
        SB["SearchBar.tsx<br>Geocoder / location search"]
        VMS["VisualModeSelector.tsx<br>DEFAULT/SATELLITE/FLIR/NVG/CRT"]
        KS["KeyboardShortcuts.tsx<br>Keyboard layer toggles"]
        CC["CctvViewer.tsx<br>Embedded camera feed panel"]
        DP["DossierPanel.tsx<br>Entity intelligence dossier"]
        TOAST["Toast.tsx + useToasts<br>Non-blocking status messages"]
    end

    LAYOUT --> Decoy
    LAYOUT --> Dashboard
    PAGE_ROOT --> DL
    DL --> CL
    CL --> HA
    PAGE_DASH --> MAP
    PAGE_DASH --> LP
    PAGE_DASH --> SB
    PAGE_DASH --> VMS
    PAGE_DASH --> KS
    PAGE_DASH --> TOAST
    MAP --> CC
    MAP --> DP
```

---

## DecoyLanding — The Cover Story

The decoy page ([`src/components/landing/DecoyLanding.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/landing/DecoyLanding.tsx#L1)) presents as a marketplace for absurdist commercial services. It is entirely convincing as a legitimate (if eccentric) website.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Services["Decoy Services"]
        S1["Whiskers & Associates<br>Feline Tax Preparation Since 1987"]
        S2["Department of Redundancy Department<br>Redundant redundancy services"]
        S3["Other absurdist services..."]
    end
    subgraph Triggers["Hidden Auth Triggers"]
        T1["KONAMI: ↑↑↓↓←→←→BA<br>Window keydown listener<br>Compares to 10-key sequence"]
        T2["Click sequence: copyright/footer<br>5 clicks within 3 seconds"]
    end
    subgraph HiddenLayer["Auth Modal Layer"]
        MODAL["CovertLogin / HiddenAuth modal<br>Fixed overlay — full screen<br>90% black backdrop"]
    end
    Services --> Triggers
    Triggers --> HiddenLayer
```

Konami code implementation ([`DecoyLanding.tsx:8`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/landing/DecoyLanding.tsx#L8)):
```ts
const KONAMI = [
  "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
  "b","a",
]
```

Framer Motion animates the service cards and page transitions. The page has no visual indication of the hidden functionality.

---

## ShadowbrokerMap — Tactical Display Engine

The 53KB map component ([`src/components/map/ShadowbrokerMap.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/map/ShadowbrokerMap.tsx#L1)) is the heart of the platform. It:

1. Initializes a MapLibre GL JS instance with dark base tile styling
2. Subscribes to `activeLayers` prop changes
3. For each active layer, calls the corresponding data fetcher
4. Renders fetched data as MapLibre layers (Circle, Symbol, Fill, Line)
5. Reports health status and entity counts via callbacks

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant DASH as DashboardPage
    participant MAP as ShadowbrokerMap
    participant ML as MapLibre GL
    participant FETCHER as Data Fetchers

    DASH->>MAP: activeLayers prop changed
    MAP->>FETCHER: Fetch enabled layer data
    FETCHER-->>MAP: Typed data arrays
    MAP->>ML: removeLayer/removeSource (cleanup)
    MAP->>ML: addSource(GeoJSON data)
    MAP->>ML: addLayer(circle/symbol/fill/line config)
    ML-->>MAP: Rendered on WebGL canvas
    MAP->>DASH: onHealthChange({layer: {status}})
    MAP->>DASH: onStatsChange({layer: count})
```

---

## Visual Mode System

Five rendering modes applied via CSS class on the map container ([`VisualModeSelector.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/panels/VisualModeSelector.tsx#L1)):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Modes["Visual Modes (VisualMode type)"]
        M1["DEFAULT<br>Dark satellite base<br>Standard color scheme"]
        M2["SATELLITE<br>High-res imagery tiles<br>Terrain visible"]
        M3["FLIR<br>FLIR-palette filter<br>Heat map aesthetic"]
        M4["NVG<br>Green phosphor overlay<br>Night vision emulation"]
        M5["CRT<br>Scanline CSS overlay<br>Retro terminal aesthetic"]
    end
```

Mode is passed as prop to `ShadowbrokerMap` and synced to the URL: `?mode=FLIR`.

---

## LayerPanel — Intelligence Layer Control

The 264px-wide sidebar ([`src/components/panels/LayerPanel.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/panels/LayerPanel.tsx#L97)) renders all 22 layer toggles grouped by category with a live search filter.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph TD
    LP["LayerPanel"] --> HEADER["Header: 'Data Layers'<br>active / total count"]
    LP --> FILTER["Search filter input<br>Filters by name or category"]
    LP --> SCROLL["Scrollable layer list"]
    SCROLL --> CAT1["Surveillance"]
    SCROLL --> CAT2["Aviation"]
    SCROLL --> CAT3["Maritime"]
    SCROLL --> CAT4["Ground / Space / SIGINT"]
    SCROLL --> CAT5["Environment"]
    SCROLL --> CAT6["Infrastructure / Geopolitics / Overlays"]
    CAT1 --> BTN["LayerButton<br>Icon · Name · HealthDot"]
    LP --> FOOTER["Footer: BLACKTIVISM OSINT v0.4"]
```

Health dot logic ([`LayerPanel.tsx:88`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/panels/LayerPanel.tsx#L88)):
```ts
const healthDot = (status?: string) => {
  switch (status) {
    case 'online':   return 'bg-green-500'
    case 'degraded': return 'bg-amber-500'
    case 'offline':  return 'bg-red-500'
    default:         return 'bg-gray-700'
  }
}
```

---

## Aigency Design System — OKLCH Color Tokens

From [`ARCHITECTURE.md:22`](https://github.com/AReid987/shadowbroker-deployment/blob/main/ARCHITECTURE.md#L22) and [`src/app/globals.css`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/globals.css):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Void["Void Surfaces (Hue 250)"]
        V1["--aig-void-deep<br>oklch(0.10 0.015 250)<br>Page background"]
        V2["--aig-void-base<br>oklch(0.13 0.015 250)<br>Panel backgrounds"]
        V3["--aig-void-raised<br>oklch(0.17 0.015 250)<br>Controls"]
        V4["--aig-void-glass<br>oklch(0.20 0.020 250)<br>Glass panels"]
    end
    subgraph Accent["Warm Amber (Hue 65)"]
        A1["--aig-accent-warm<br>oklch(0.75 0.150 65)<br>Primary highlights"]
        A2["--aig-accent-warm-dim<br>oklch(0.55 0.100 65)<br>Disabled / dimmed"]
    end
```

**Typography Stack** (from `ARCHITECTURE.md:38`):
- `JetBrains Mono` — primary dashboard font
- `VT323` — TTY display indicators
- `Share Tech Mono` — fallback display font
- All three loaded via Google Fonts in `layout.tsx`

**Design Constraints**:
- `border-radius: 0px` on all instrument surfaces (sharp corners)
- No drop shadows inside glass layouts
- Bayer matrix dither via `.glass-surface` CSS class applied to dashboard root ([`dashboard/page.tsx:157`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L157))

---

## Top Bar Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ BLACKTIVISM  ●  SECURE CONNECTION  │  N/M SOURCES  │  UTC TIMESTAMP  │
│                                    SearchBar  KBD  Mode  ↺  Layers  EXIT │
└──────────────────────────────────────────────────────────────────────┘
```

Reference: [`dashboard/page.tsx:158`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L158)

## Bottom Status Bar

```
┌──────────────────────────────────────────────────────────────────────┐
│ N LAYERS ACTIVE  │  MODE: X  │  N CAMERAS  │  N MIL AIR  │  ...     │
│                                              BLACKTIVISM v0.4        │
└──────────────────────────────────────────────────────────────────────┘
```

Reference: [`dashboard/page.tsx:254`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L254)

<!-- Sources: src/components/landing/DecoyLanding.tsx:1, src/components/map/ShadowbrokerMap.tsx:1, src/components/panels/LayerPanel.tsx:88, src/app/dashboard/page.tsx:157, ARCHITECTURE.md:22 -->
