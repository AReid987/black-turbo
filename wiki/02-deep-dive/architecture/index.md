# System Architecture

A deep-dive into the structural decisions behind BLACKTIVISM — layered from infrastructure down to runtime data flow.

---

## Deployment Topology

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph TB
    subgraph CDN["Vercel Edge Network (Global CDN)"]
        EDGE["Edge Middleware<br>src/middleware.ts<br>Cookie guard — runs before any render"]
    end

    subgraph Serverless["Vercel Serverless Functions"]
        AUTH_V["/api/auth/validate<br>POST · Key → AES session token → cookie"]
        AUTH_S["/api/auth/session<br>GET · Decrypt &amp; verify session token"]
        PROXY["/api/proxy/shodan<br>GET · Server-side Shodan proxying"]
        CODES["/api/codes/*<br>Admin invite-code management"]
    end

    subgraph SSR["Next.js Pages (SSR/CSR Split)"]
        ROOT["src/app/page.tsx<br>Root route — renders DecoyLanding<br>Zero dashboard exposure"]
        DASH["src/app/dashboard/page.tsx<br>Tactical Display — client component<br>Auth check on mount"]
    end

    subgraph MapEngine["Client Map Engine"]
        MAP["ShadowbrokerMap.tsx<br>53 KB — MapLibre GL JS<br>dynamic import, SSR=false"]
        LAYERS["22 Data Layer Renderers<br>Circle / Symbol / Fill / Line layers"]
    end

    subgraph DataFetch["Data Fetchers (src/lib/data/)"]
        AIR["aircraft.ts → adsb.lol/v2/mil"]
        COM["commercialFlights.ts → adsb.lol bbox queries"]
        VES["vessels.ts → aisstream.io (+ static fallback)"]
        SAT["satellites.ts → static TLE-derived positions"]
        CCTV["cctv.ts + cctvPipeline.ts → Digitraffic.fi + scraped feeds"]
        SHODAN_TS["shodan.ts → /api/proxy/shodan → Shodan API"]
        ENV["earthquakes, volcanoes, fires, weather, air_quality → USGS, EONET, OpenAQ"]
        INFRA["infrastructure.ts → 68KB static dataset<br>Bases, power plants, data centers"]
    end

    subgraph External["External APIs"]
        ADSB_LOL["adsb.lol"]
        AISSTREAM["aisstream.io"]
        USGS_EQ["USGS Earthquake API"]
        OPENAQ_API["OpenAQ v3"]
        SHODAN_API["Shodan Search API"]
        DIGITRAFFIC_CAM["Digitraffic.fi CCTV"]
    end

    CDN --> Serverless
    CDN --> SSR
    SSR --> MapEngine
    MapEngine --> DataFetch
    DataFetch --> External
    AUTH_V --> SHODAN_TS
```

---

## Request Lifecycle

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant C as Client Browser
    participant MW as Edge Middleware
    participant D as DecoyLanding
    participant AV as /api/auth/validate
    participant AS as /api/auth/session
    participant DB as DashboardPage
    participant SM as ShadowbrokerMap

    C->>MW: GET / (no cookie)
    MW->>D: Pass — public route
    D-->>C: Decoy HTML (absurdist biz)

    Note over C: Konami code / click trigger
    C->>AV: POST /api/auth/validate {key}
    AV->>AV: constantTimeCompare(key, SECRET_KEY)
    AV->>AV: checkServerRateLimit(req)
    AV->>AV: createSession() → AES encrypt
    AV-->>C: 200 + Set-Cookie shadow_session (HttpOnly, SameSite=Strict)

    C->>MW: GET /dashboard
    MW->>MW: cookie.get("shadow_session") present?
    MW->>DB: Forward (token present)
    DB->>AS: fetch /api/auth/session
    AS->>AS: AES decrypt → check expiry
    AS-->>DB: {valid: true}
    DB->>SM: Mount ShadowbrokerMap
    SM->>SM: Load active layers
    SM-->>C: Interactive tactical display
```

---

## Module Dependency Graph

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph LR
    subgraph App["src/app/"]
        PAGE["page.tsx"]
        DASH["dashboard/page.tsx"]
        AV["api/auth/validate"]
        AS["api/auth/session"]
        AP["api/proxy/shodan"]
    end
    subgraph Comp["src/components/"]
        DL["landing/DecoyLanding.tsx"]
        CL["landing/CovertLogin.tsx"]
        HA["auth/HiddenAuth.tsx"]
        SM["map/ShadowbrokerMap.tsx"]
        LP["panels/LayerPanel.tsx"]
        SB["panels/SearchBar.tsx"]
        VM["panels/VisualModeSelector.tsx"]
        KS["panels/KeyboardShortcuts.tsx"]
        CC["panels/CctvViewer.tsx"]
    end
    subgraph Lib["src/lib/"]
        AUTH["auth.ts"]
        RL["rateLimit.ts"]
        IC["inviteCodes.ts"]
        FWR["utils/fetchWithRetry.ts"]
        DC["utils/dataCache.ts"]
        DataMods["data/*.ts (21 modules)"]
    end

    PAGE --> DL
    DL --> CL
    DL --> HA
    HA --> AUTH
    AV --> AUTH
    AV --> RL
    AS --> AUTH
    DASH --> SM
    DASH --> LP
    DASH --> SB
    DASH --> VM
    DASH --> KS
    SM --> DataMods
    DataMods --> FWR
    DataMods --> DC
    AP --> AUTH
```

---

## Next.js App Router Structure

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph TD
    subgraph AppRouter["Next.js App Router (src/app/)"]
        LAYOUT["layout.tsx<br>Root layout — fonts, global CSS"]
        ROOT_PAGE["page.tsx<br>Route: /"]
        DASH_PAGE["dashboard/page.tsx<br>Route: /dashboard"]
        API_AUTH_V["api/auth/validate/route.ts<br>Route: POST /api/auth/validate"]
        API_AUTH_S["api/auth/session/route.ts<br>Route: GET /api/auth/session"]
        API_PROXY["api/proxy/shodan/route.ts<br>Route: GET /api/proxy/shodan"]
        API_CCTV["api/cctv/route.ts<br>Route: GET /api/cctv"]
        API_CODES["api/codes/route.ts<br>Admin code management"]
    end
    LAYOUT --> ROOT_PAGE
    LAYOUT --> DASH_PAGE
    LAYOUT --> API_AUTH_V
    LAYOUT --> API_AUTH_S
    LAYOUT --> API_PROXY
    LAYOUT --> API_CCTV
    LAYOUT --> API_CODES
```

---

## Key Architectural Decisions

### 1. Dual-Identity Architecture

The core security insight: the decoy page and the dashboard share the same Next.js process, same Vercel deployment, same domain. Route protection is entirely cookie-based at the edge middleware layer.

This means:
- No separate servers to maintain
- Single Vercel project, single deploy
- The decoy page has zero references to dashboard code in its bundle
- Middleware runs before RSC rendering — no dashboard code leaks to unauthenticated requests

Reference: [`src/middleware.ts:4`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/middleware.ts#L4)

### 2. MapLibre via Dynamic Import

`ShadowbrokerMap` is a 53KB component that imports MapLibre GL JS. MapLibre uses browser APIs (`window.devicePixelRatio`, WebGL context) that are unavailable in Node.js. The solution:

```ts
const ShadowbrokerMap = dynamic(
  () => import('@/components/map/ShadowbrokerMap'),
  { ssr: false }
)
```

Reference: [`src/app/dashboard/page.tsx:15`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L15)

### 3. Stateless Authentication

No database, no user table. Auth state is entirely encoded in an AES-encrypted cookie:

```json
{
  "keyHash": "sha256(key + SECRET_KEY)",
  "timestamp": 1716000000000,
  "expiry":    1716003600000
}
```

Session validity = `Date.now() < expiry`. No server-side session store. This works because the encryption key is the source of truth.

Reference: [`src/lib/auth.ts:48`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/auth.ts#L48)

### 4. Data Fetcher Resilience Pattern

Every data module follows: **live API → in-memory cache → static fallback**.

```ts
// Pattern in aircraft.ts, vessels.ts, cctv.ts, etc.
try {
  const res = await fetchWithRetry(URL, { retries: 2, timeout: 8000 })
  const result = transformData(await res.json())
  setCache(KEY, result)         // localStorage cache
  return result
} catch (err) {
  return getCache(KEY) || STATIC_FALLBACK
}
```

Reference: [`src/lib/data/aircraft.ts:16`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/aircraft.ts#L16)

---

## Performance Characteristics

| Aspect | Approach |
|--------|---------|
| Initial load | Decoy page only — map bundle excluded from unauthenticated sessions |
| Map bundle | Dynamic import (code-split) — loads on `/dashboard` only |
| Data freshness | Client-side polling per layer; 5-min `localStorage` TTL |
| Security | AES-256 session tokens; SHA-256 key hashing; constant-time comparison |
| Static assets | Vercel CDN; `image/avif` + `image/webp` formats |

<!-- Sources: src/middleware.ts:4, src/app/dashboard/page.tsx:15, src/lib/auth.ts:48, src/lib/data/aircraft.ts:16, src/lib/utils/fetchWithRetry.ts:7 -->
