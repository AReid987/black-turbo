# Integrations

A complete catalog of every external data source, API contract, authentication method, and fallback strategy used by BLACKTIVISM.

---

## Integration Map

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph TB
    APP["BLACKTIVISM Frontend"]

    subgraph Free["Free / No Key Required"]
        ADSB["adsb.lol<br>ADS-B Exchange<br>Military + Commercial aircraft"]
        USGS["USGS Earthquake Hazards Program<br>GeoJSON feed (M2.5+)"]
        EONET["NASA EONET<br>Earth Observatory Natural Events"]
        FIRMS["NASA FIRMS<br>Fire Information for Resource Mgmt"]
        DIGIT["Digitraffic.fi<br>Finnish traffic cameras (MJPEG/image)"]
    end

    subgraph KeyRequired["API Key Required"]
        AISSTREAM["AISstream.io<br>AIS vessel tracking<br>WebSocket/REST<br>Key: NEXT_PUBLIC_AISTREAM_API_KEY"]
        SHODAN_INT["Shodan<br>Internet-connected device search<br>Server-proxied key<br>Key: SHODAN_API_KEY"]
        OPENAQ["OpenAQ v3<br>Global air quality sensors<br>Key optional for higher rate limits"]
    end

    subgraph Static["Static / Derived Data"]
        TLE["Satellite positions<br>TLE-derived (no live API)"]
        INFRA_DB["Infrastructure DB<br>68KB curated dataset<br>Bases, power, data centers"]
        CSG["Carrier Strike Groups<br>20 hardcoded positions"]
        CONFLICT_DB["Conflict Zones<br>15 static entries + status"]
    end

    APP -->|"Direct client fetch"| Free
    APP -->|"Client fetch with key"| AISSTREAM
    APP -->|"Server proxy"| SHODAN_INT
    APP -->|"Optional key"| OPENAQ
    APP -->|"No network"| Static
```

---

## adsb.lol — ADS-B Aircraft Tracking

**Military aircraft** ([`src/lib/data/aircraft.ts:18`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/aircraft.ts#L18)):

```
GET https://api.adsb.lol/v2/mil
→ { ac: [{ hex, lat, lon, alt_baro, gs, track, flight, t, category }] }
```

**Commercial flights** ([`src/lib/data/commercialFlights.ts:40`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/commercialFlights.ts#L40)):

```
GET https://api.adsb.lol/v2/lat/{center_lat}/lon/{center_lon}/dist/500
→ { ac: [...] }  (500nm radius around center)
```

| Property | Notes |
|----------|-------|
| Auth | None required |
| Rate Limits | Unstated; keep to < 10 req/min |
| Refresh | Per user layer-refresh action |
| Fallback | Empty array (no static aircraft fallback) |
| Retries | 2 retries, 8s timeout |

---

## AISstream.io — Vessel Tracking

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant Client
    participant VesselsTS as vessels.ts
    participant AIS as aisstream.io/api/v0/latest

    Client->>VesselsTS: fetchVessels()
    VesselsTS->>AIS: GET ?apiKey=NEXT_PUBLIC_AISTREAM_API_KEY
    AIS-->>VesselsTS: { messages: [{MMSI, Name, Latitude, ...}] }
    VesselsTS->>VesselsTS: Map to Vessel interface<br>Filter lat && lng truthy
    VesselsTS->>VesselsTS: setCache("vessels", result)
    VesselsTS-->>Client: Vessel[]

    Note over VesselsTS: On any error:
    VesselsTS->>VesselsTS: getCache("vessels") || STATIC_FALLBACK
    VesselsTS-->>Client: 20 static vessel positions
```

Reference: [`src/lib/data/vessels.ts:21`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/vessels.ts#L21)

**Static fallback** includes 20 named vessels (cargo ships, carriers, destroyers, submarines from major navies) at geopolitically notable positions.

---

## Shodan — Internet Device Intelligence

Shodan requires a server-side proxy to prevent exposing the API key in the client bundle ([`src/lib/data/shodan.ts:34`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/shodan.ts#L34)):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant Map as ShadowbrokerMap
    participant Shodan_TS as shodan.ts (client)
    participant Proxy as /api/proxy/shodan (server)
    participant ShodanAPI as api.shodan.io

    Map->>Shodan_TS: searchShodan("webcam")
    Shodan_TS->>Proxy: GET /api/proxy/shodan?q=webcam
    Proxy->>Proxy: Verify shadow_session cookie
    Proxy->>ShodanAPI: GET /shodan/host/search?key=SHODAN_API_KEY&q=webcam
    ShodanAPI-->>Proxy: { total, matches: [{ip_str, location, ports, ...}] }
    Proxy-->>Shodan_TS: Forwarded JSON
    Shodan_TS->>Shodan_TS: Map to ShodanHost[]<br>Filter lat && lng
    Shodan_TS->>Shodan_TS: setCache("shodan_webcam", result)
    Shodan_TS-->>Map: ShodanSearchResult
```

Shodan query presets ([`shodan.ts:25`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/shodan.ts#L25)):
```ts
const SHODAN_QUERIES = [
  'webcam', 'ipcam', 'dvr', 'router', 
  'printer', 'industrial control system'
]
```

Port-based color coding for map markers:
- Ports 554/80/8080 → orange (video/camera)
- Ports 21/23 → yellow (FTP/Telnet)
- Ports 502/44818 → red (Modbus/EtherNet/IP — industrial control)

---

## USGS Earthquake API

```
GET https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson
→ GeoJSON FeatureCollection
  features[].properties: { mag, place, time, url, detail }
  features[].geometry.coordinates: [lng, lat, depth]
```

No API key, no rate limits (USGS public data). [`earthquakes.ts`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/earthquakes.ts) fetches M2.5+ events from the past 7 days.

---

## Digitraffic.fi — CCTV Camera Feeds

Finnish road authority traffic cameras. All publicly accessible MJPEG/JPEG streams ([`cctv.ts:14`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/cctv.ts#L14)):

```
Image URL pattern: https://weathercam.digitraffic.fi/C{6-digit-code}.jpg
Refresh interval:  10 seconds
Type:             'image' (static JPEG, auto-refreshed by CctvViewer)
```

The CCTV pipeline ([`cctvPipeline.ts`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/data/cctvPipeline.ts)) aggregates additional camera sources and performs health checks.

---

## OpenAQ — Air Quality Data

```
GET https://api.openaq.org/v3/locations?...
→ { results: [{ coordinates, measurements: [{parameter, value, unit}] }] }
```

OpenAQ v3 supports optional API key for higher rate limits. Without key, ~60 req/hour is the free tier.

---

## NASA EONET — Earth Events

```
GET https://eonetapi.nasa.gov/v3/events?limit=100&status=open
→ { events: [{ id, title, categories, geometry: [{coordinates, date}] }] }
```

Covers: wildfires, volcanic activity, severe storms, sea and lake ice, dust and haze.

---

## Integration Health Status

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Always["Always Available (no key)"]
        I1["adsb.lol ✓"]
        I2["USGS ✓"]
        I3["EONET ✓"]
        I4["Digitraffic.fi ✓"]
        I5["Static datasets ✓"]
    end
    subgraph KeyNeeded["Requires API Key"]
        K1["AISstream.io — vessels live"]
        K2["Shodan — device intel"]
        K3["OpenAQ — air quality live"]
    end
    subgraph Degraded["Graceful Degradation"]
        D1["vessels → 20-ship static fallback"]
        D2["shodan → empty (no fallback)"]
        D3["airquality → empty or cached"]
    end

    K1 -->|"no key"| D1
    K2 -->|"no key"| D2
    K3 -->|"no key"| D3
```

<!-- Sources: src/lib/data/aircraft.ts:18, src/lib/data/vessels.ts:21, src/lib/data/shodan.ts:34, src/lib/data/cctv.ts:14, src/lib/data/commercialFlights.ts:40 -->
