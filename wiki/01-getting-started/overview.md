# BLACKTIVISM OSINT — Project Overview

> **Operational Security Notice**: This platform uses a dual-identity architecture. The public-facing website presents as a fictional commercial business. The actual OSINT intelligence dashboard is accessible only to holders of a valid secret key.

## What Is This?

**BLACKTIVISM** (internal codename: `shadowbroker-deployment`) is a covert geospatial intelligence platform built on Next.js 14. It aggregates real-time global telemetry from 21+ open-source data providers and renders them on an interactive MapLibre GL world map — wrapped in a decoy landing page that presents as a harmless, absurdist commercial website.

The system has exactly two user-visible states:

| State | URL | Who Sees It |
|-------|-----|-------------|
| Decoy ("Spreadsheet Enthusiasts" / absurdist services) | `/` | Everyone |
| OSINT Tactical Display | `/dashboard` | Session-cookie holders only |

---

## High-Level Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed', 'secondaryColor': '#0d2137', 'tertiaryColor': '#0a1628'}}}%%
graph TB
    subgraph Public["Public Internet"]
        USER["🌐 Browser / User"]
    end

    subgraph Vercel["Vercel Edge (CDN + Serverless)"]
        DECOY["/ · DecoyLanding<br>Absurdist business site"]
        MW["Middleware<br>Cookie guard"]
        AUTH_API["/api/auth/validate<br>Key → Session cookie"]
        SESSION_API["/api/auth/session<br>Validate existing cookie"]
        PROXY["/api/proxy/shodan<br>API key concealment"]
        DASH["/dashboard<br>BLACKTIVISM Tactical Display"]
    end

    subgraph External["External Open-Source APIs"]
        ADSB["adsb.lol<br>Military &amp; commercial ADS-B"]
        AISSTREAM["AISstream.io<br>Vessel AIS data"]
        USGS["USGS Earthquake API"]
        OPENAQ["OpenAQ Air Quality"]
        DIGITRAFFIC["Digitraffic.fi<br>Finland CCTV cameras"]
        SHODAN_API["Shodan Search API<br>(server-proxied)"]
    end

    USER -->|"HTTP request"| MW
    MW -->|"No cookie → serve"| DECOY
    MW -->|"Has cookie → allow"| DASH
    DECOY -->|"Konami / click trigger"| AUTH_API
    AUTH_API -->|"Set shadow_session cookie"| USER
    DASH -->|"Check session"| SESSION_API
    DASH -->|"Fetch layer data"| ADSB
    DASH -->|"Fetch layer data"| AISSTREAM
    DASH -->|"Fetch layer data"| USGS
    DASH -->|"Fetch layer data"| OPENAQ
    DASH -->|"Fetch layer data"| DIGITRAFFIC
    DASH -->|"Server-side proxy"| PROXY
    PROXY -->|"Authenticated call"| SHODAN_API
```

---

## Intelligence Layer Taxonomy

The dashboard exposes **22 toggleable data layers** across 8 operational categories:

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
mindmap
  root((BLACKTIVISM<br>Layers))
    Surveillance
      CCTV Mesh 900+
    Aviation
      Military Aircraft
      Commercial Flights
    Maritime
      Naval Traffic
      Carrier Strike Groups
    Ground
      Rail Tracking
    Space
      Satellites 24
    SIGINT
      KiwiSDR Scanners
      Mesh APRS
      GPS Jamming
    Environment
      USGS Earthquakes
      Volcanoes
      Fire Hotspots
      Severe Weather
      Air Quality OpenAQ
    Infrastructure
      Military Bases 200+
      Power Plants 500+
      Data Centers
      Internet Outages
    Geopolitics
      Conflict Zones
    Overlays
      Day Night Terminator
      Shodan Devices
```

---

## Dual-Identity Security Model

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant B as Browser
    participant MW as Next.js Middleware
    participant D as DecoyLanding
    participant A as /api/auth/validate
    participant DB as /dashboard

    B->>MW: GET /
    MW->>D: No session cookie — serve decoy
    D-->>B: Absurdist business page

    Note over B,D: User triggers hidden auth (Konami / click)
    B->>D: Secret input sequence
    D->>B: Shows HiddenAuth modal

    B->>A: POST { key } 
    A->>A: constantTimeCompare(key, SECRET_KEY)
    A-->>B: 200 + Set-Cookie: shadow_session (AES-encrypted, 1h)

    B->>MW: GET /dashboard
    MW->>MW: Verify shadow_session cookie exists
    MW->>DB: Forward request
    DB->>A: GET /api/auth/session (confirm validity)
    DB-->>B: Tactical display rendered
```

---

## Technology Stack

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Runtime["Runtime"]
        NEXT["Next.js 14.0.4"]
        REACT["React 18.2"]
        TS["TypeScript 5.3"]
    end
    subgraph Rendering["Rendering"]
        MAPLIBRE["MapLibre GL JS<br>(dynamic import, SSR disabled)"]
        FRAMER["Framer Motion 10<br>(decoy page animations)"]
    end
    subgraph Security["Security"]
        CRYPTOJS["crypto-js 4.2<br>AES session encryption<br>SHA-256 key hashing"]
    end
    subgraph Styling["Styling"]
        TAILWIND["Tailwind CSS 3.3<br>OKLCH design tokens"]
        LUCIDE["Lucide React<br>Icon set"]
    end
    subgraph Deploy["Deploy"]
        VERCEL["Vercel<br>Edge + Serverless"]
        FLYIO["Fly.io<br>Backend (optional)"]
    end

    NEXT --> REACT
    NEXT --> TS
    NEXT --> MAPLIBRE
    NEXT --> CRYPTOJS
    NEXT --> FRAMER
    TAILWIND --> NEXT
    VERCEL --> NEXT
```

---

## Key Directories

| Path | Purpose |
|------|---------|
| [`src/app/page.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/page.tsx#L1) | Root route — renders `DecoyLanding` |
| [`src/app/dashboard/page.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L1) | OSINT tactical display |
| [`src/app/api/auth/`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/api/auth) | Auth API routes (`validate`, `session`) |
| [`src/middleware.ts`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/middleware.ts#L4) | Edge middleware — cookie-based route guard |
| [`src/lib/auth.ts`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/auth.ts#L1) | `validateKey`, `createSession`, `validateSession` |
| [`src/lib/data/`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data) | 21 geospatial data fetchers (aircraft, vessels, CCTV…) |
| [`src/components/map/ShadowbrokerMap.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/map/ShadowbrokerMap.tsx#L1) | 53 KB map engine (MapLibre, layer rendering) |
| [`src/components/landing/DecoyLanding.tsx`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/components/landing/DecoyLanding.tsx#L1) | Decoy page component |

---

## Design System: BLACKTIVISM Aigency Theme

The dashboard uses an OKLCH-based void color system and is styled as a spacecraft instrument panel:

- **Primary surface**: `oklch(0.10 0.015 250)` — deep void background  
- **Raised controls**: `oklch(0.17 0.015 250)`  
- **Accent**: `oklch(0.75 0.150 65)` — warm amber  
- **Typography**: JetBrains Mono (primary), VT323 / Share Tech Mono (display/TTY)  
- **Corners**: Sharp (0px border-radius) on all instrument surfaces  
- **Texture**: Bayer matrix dither overlay via `.glass-surface` CSS class  

See [`ARCHITECTURE.md`](https://github.com/AReid987/shadowbroker-deployment/blob/main/ARCHITECTURE.md#L22) for the full design token specification.

---

## Version

Current release: **BLACKTIVISM v0.4**  
Platform codename: **subterfuge-shadowbroker**  
Vercel team: `aigency0`

<!-- Sources: src/app/page.tsx:1, src/app/dashboard/page.tsx:1, src/middleware.ts:4, src/lib/auth.ts:1, src/components/panels/LayerPanel.tsx:38 -->
