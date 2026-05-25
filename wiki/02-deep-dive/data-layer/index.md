# Data Layer

This page covers every data source, fetch strategy, caching model, and transformation pipeline in BLACKTIVISM. All data modules live in [`src/lib/data/`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data).

---

## Data Source Inventory

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph LR
    subgraph Aviation["Aviation"]
        A1["aircraft.ts<br>adsb.lol/v2/mil<br>Military ADS-B transponders"]
        A2["commercialFlights.ts<br>adsb.lol bbox queries<br>8 world regions"]
    end
    subgraph Maritime["Maritime"]
        M1["vessels.ts<br>aisstream.io WebSocket API<br>+ 20-vessel static fallback"]
        M2["carriers.ts<br>20 hardcoded CSG positions<br>Aircraft carrier strike groups"]
    end
    subgraph Surveillance["Surveillance"]
        S1["cctv.ts<br>Digitraffic.fi + scraped feeds<br>900+ global cameras"]
        S2["cctvPipeline.ts<br>29KB — camera aggregation<br>+ health checks"]
    end
    subgraph Environment["Environment"]
        E1["earthquakes.ts<br>USGS GeoJSON feed<br>M2.5+ last 7 days"]
        E2["volcanoes.ts<br>GVP static + live VAAC"]
        E3["fires.ts<br>NASA FIRMS VIIRS hotspots"]
        E4["weather.ts<br>Severe weather alerts"]
        E5["airquality.ts<br>OpenAQ v3 REST API"]
        E6["eonet.ts<br>NASA EONET events feed"]
    end
    subgraph Space["Space"]
        SP1["satellites.ts<br>Static TLE-derived positions<br>24 notable satellites"]
    end
    subgraph SIGINT["SIGINT"]
        SIG1["radios.ts<br>KiwiSDR network nodes"]
        SIG2["mesh.ts<br>APRS mesh nodes (26)"]
        SIG3["gpsJamming.ts<br>GPSJAM.org-derived<br>15 active zones"]
    end
    subgraph InfraSec["Infrastructure / Intel"]
        I1["infrastructure.ts<br>68KB static dataset<br>Bases, power, data centers"]
        I2["shodan.ts<br>Shodan Search API<br>via /api/proxy/shodan"]
        I3["outages.ts<br>Internet outage monitoring"]
        I4["conflicts.ts<br>15 active conflict zones<br>Static with status"]
        I5["trains.ts<br>19 major rail routes<br>Static GeoJSON-like"]
    end
```

---

## Fetch Resilience Pattern

Every data module uses the same three-tier fetch pattern:

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
flowchart TD
    START(["fetchXxx() called"]) --> LIVE["fetchWithRetry(API_URL)<br>retries: 2, timeout: 8s"]
    LIVE -->|"200 OK"| TRANSFORM["Transform response<br>Normalize to local interface"]
    TRANSFORM --> SETCACHE["setCache(KEY, result)<br>Write to localStorage<br>TTL: 5 min"]
    SETCACHE --> RETURN(["Return live data"])

    LIVE -->|"Error / timeout"| GETCACHE["getCache&lt;T&gt;(KEY)<br>Read localStorage"]
    GETCACHE -->|"Cache hit"| RETURN2(["Return cached data"])
    GETCACHE -->|"Cache miss"| FALLBACK["Return static FALLBACK[]<br>Hardcoded in module"]
    FALLBACK --> RETURN3(["Return fallback data"])
```

Implementation reference — [`src/lib/utils/fetchWithRetry.ts:7`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/utils/fetchWithRetry.ts#L7):

```ts
export async function fetchWithRetry(
  url: string,
  options: RequestInit & FetchOptions = {}
): Promise<Response> {
  const { retries = 3, backoff = 1000, timeout = 10000, ...fetchOptions } = options
  // AbortController timeout + exponential-ish backoff
}
```

---

## Cache Architecture

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
erDiagram
    CacheEntry {
        string key "sb_ prefix + module key"
        any data "Typed T serialized as JSON"
        number timestamp "Date.now() at write"
    }
    localStorage ||--o{ CacheEntry : "contains"
```

Cache keys (prefix `sb_`):

| Module | Cache Key | TTL |
|--------|-----------|-----|
| `aircraft.ts` | `sb_military_aircraft` | 5 min |
| `vessels.ts` | `sb_vessels` | 5 min |
| `shodan.ts` | `sb_shodan_{query}` | 5 min |
| `cctv.ts` | `sb_cctv` | 5 min |

Reference: [`src/lib/utils/dataCache.ts:2`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/utils/dataCache.ts#L2)

> **Note**: Cache lives in `localStorage` — client-side only. Server-side data fetchers bypass cache (they don't have access to `window`). The guard is `if (typeof window === 'undefined') return null`.

---

## Data Interfaces

### Aircraft (Military)
From [`src/lib/data/aircraft.ts:1`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/aircraft.ts#L1):
```ts
interface Aircraft {
  hex: string        // ICAO transponder code
  lat: number
  lng: number
  altitude: number   // feet (baro)
  speed: number      // ground speed knots
  heading: number    // degrees
  callsign?: string
  type?: string      // ICAO aircraft type code
  category?: string
}
```

### Vessel (AIS)
From [`src/lib/data/vessels.ts:4`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/vessels.ts#L4):
```ts
interface Vessel {
  mmsi: number       // Maritime Mobile Service Identity
  name: string
  lat: number
  lng: number
  speed: number      // knots (SOG)
  heading: number    // degrees (COG)
  type: string       // Ship category string
  flag?: string      // ISO 3166-1 alpha-2 country code
  destination?: string
  eta?: string
}
```

### CCTV Camera
From [`src/lib/data/cctv.ts:1`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/cctv.ts#L1):
```ts
interface CctvCamera {
  id: string
  name: string
  lat: number
  lng: number
  url: string
  type: 'mjpeg' | 'image' | 'hls' | 'embed'
  country: string
  city: string
  refreshInterval?: number   // seconds between frame refreshes
  region?: string
}
```

### Satellite
From [`src/lib/data/satellites.ts:1`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/satellites.ts#L1):
```ts
interface Satellite {
  name: string
  noradId: number    // NORAD catalog number
  lat: number
  lng: number
  altitude: number   // km
  type: string       // 'Space Station' | 'Reconnaissance' | 'Navigation' | etc.
  operator: string
  launchYear: number
}
```

### Shodan Host
From [`src/lib/data/shodan.ts:4`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/shodan.ts#L4):
```ts
interface ShodanHost {
  ip_str: string
  latitude: number
  longitude: number
  city?: string
  country_code?: string
  org?: string
  isp?: string
  os?: string
  ports: number[]
  hostnames: string[]
  product?: string
  version?: string
  vulns?: string[]   // CVE IDs if Shodan detected vulnerabilities
}
```

---

## Commercial Flights — World Bounding Box Strategy

Commercial flights use a bounding-box approach across 8 world regions to avoid single-request rate limits on adsb.lol ([`commercialFlights.ts:20`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/commercialFlights.ts#L20)):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Regions["8 World Bounding Boxes"]
        R1["NA-West<br>25-55°N, 130-85°W"]
        R2["NA-East<br>25-55°N, 85-55°W"]
        R3["Europe<br>35-70°N, 15°W-40°E"]
        R4["Asia-East<br>20-50°N, 100-150°E"]
        R5["Asia-South<br>5-35°N, 65-110°E"]
        R6["Oceania<br>40-10°S, 110-180°E"]
        R7["SA<br>35°S-10°N, 85-35°W"]
        R8["Africa<br>35°S-35°N, 20°W-55°E"]
    end
    FETCH["fetchCommercialFlights()"] -->|"First 3 regions/call<br>rate-limit friendly"| R1
    FETCH --> R2
    FETCH --> R3
```

---

## Layer Health Monitoring

[`src/lib/utils/useDataHealth.ts`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/utils/useDataHealth.ts) tracks the status of each active data source. `ShadowbrokerMap` calls `onHealthChange(healthMap)` when a fetch succeeds or fails. The `LayerPanel` renders a colored dot per layer:

- **Green** (`online`): last fetch succeeded
- **Amber** (`degraded`): fetch succeeded but data quality low
- **Red** (`offline`): last fetch failed, serving cache or fallback

<!-- Sources: src/lib/data/aircraft.ts:1, src/lib/data/vessels.ts:4, src/lib/data/cctv.ts:1, src/lib/utils/dataCache.ts:2, src/lib/utils/fetchWithRetry.ts:7 -->
