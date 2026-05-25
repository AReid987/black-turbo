# Executive Briefing — BLACKTIVISM Platform

## What We Built

BLACKTIVISM is a real-time global intelligence monitoring platform — a private, web-based map that shows where significant things are happening in the world, right now.

It displays live positions of military aircraft, naval vessels, satellites, active conflict zones, earthquake activity, CCTV camera feeds, and more — all aggregated from publicly available data sources into a single, unified interface.

---

## Why It Exists

The core need was a private intelligence dashboard that could be operated with zero risk of casual discovery. The solution uses a two-layer architecture:

- **What the public sees**: A convincing, harmless-looking website (a fictional marketplace for absurdist business services)
- **What authorized users see**: A full global OSINT (Open Source Intelligence) tactical display

Access requires a secret key shared only with authorized individuals. No usernames, no accounts, no trails.

---

## Capability Map

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
mindmap
  root((BLACKTIVISM<br>Capabilities))
    Air Intelligence
      Live military aircraft positions worldwide
      Commercial flight tracking 8 world regions
    Maritime Intelligence
      Naval traffic and carrier strike groups
      20 named vessels at strategic positions
    Space Intelligence
      24 tracked satellites
      ISS Tiangong GPS SBIRS reconnaissance
    Surveillance
      900+ CCTV camera feeds globally
      Live Finnish road cameras verified working
    Cyber Intelligence
      Shodan device intelligence
      Exposed industrial control systems
      Internet outage monitoring
    Environmental Awareness
      USGS earthquake data real-time
      60 active volcanoes
      NASA fire hotspots
      Severe weather alerts
      Air quality sensors global
    Geopolitical Context
      15 active conflict zones with status
      GPS jamming zones 15 active
      Radio scanner network 21 nodes
    Infrastructure Intelligence
      200+ military bases
      500+ power plants
      30 major data centers
```

---

## What We Did Not Build

This is important for realistic expectations:

- **No proprietary intelligence** — all data is public (OSINT). We aggregate; we do not produce
- **No historical data** — this is a live snapshot only; nothing is stored or searchable over time
- **No alerts or notifications** — the dashboard requires a human actively watching it
- **No user management** — access is binary: you have the key or you don't
- **No analytics** — we deliberately collect no user data

---

## Access Control Model

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
graph LR
    subgraph Access["Access Tiers"]
        ADMIN["Key Holder (Admin)<br>Has the master secret key<br>Full dashboard access<br>Can create invite codes"]
        INVITED["Invited User<br>Has a one-time invite code<br>Full dashboard access<br>Cannot create more codes"]
        PUBLIC["Everyone Else<br>Sees the decoy website<br>Cannot access dashboard"]
    end
    ADMIN -->|"Creates invite codes"| INVITED
    INVITED -->|"Sees same dashboard"| ADMIN
```

**Emergency lockout**: Replace the `SECRET_KEY` environment variable and redeploy. This immediately invalidates all sessions and invite codes. No one can access the dashboard until the new key is distributed.

---

## Operating Cost

| Component | Platform | Monthly Cost |
|-----------|----------|-------------|
| Frontend (website + dashboard) | Vercel | Free tier (hobby) |
| Optional backend API | Fly.io | ~$2.09/month |
| Domain (if custom) | Your registrar | ~$10-15/year |

The platform is designed to run at near-zero operating cost.

---

## Risk Register

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph TD
    subgraph High["High Risk"]
        H1["Secret key exposed<br>Immediate action: rotate key + redeploy<br>Time to lock: ~2 minutes"]
    end
    subgraph Medium["Medium Risk"]
        M1["External data source goes offline<br>Automatic fallback to cached/static data<br>No outage — degraded data quality"]
        M2["Platform discovered<br>Decoy website provides plausible deniability<br>No OSINT data accessible without key"]
    end
    subgraph Low["Low Risk"]
        L1["Session hijacking<br>Mitigated: encrypted sessions, 1-hour TTL, SameSite cookies"]
        L2["Brute-force key guessing<br>Mitigated: 5-attempt rate limit, 15-minute lockout"]
    end
```

---

## What "Open Source Intelligence" Means Here

Every data source is public. We do not hack, intercept, or access private systems. Examples:

- Aircraft positions: broadcast by the aircraft's own transponder (ADS-B)
- Vessel positions: broadcast by the ship's own AIS radio
- CCTV feeds: cameras on publicly accessible internet streams
- Earthquake data: published in real time by the US Geological Survey
- Satellite positions: calculated from publicly released orbital data

The intelligence value comes from aggregation and visualization, not from access to non-public data.

<!-- Sources: src/components/panels/LayerPanel.tsx:38, src/lib/auth.ts:1, DEPLOYMENT.md:32, README.md:1, ARCHITECTURE.md:1 -->
