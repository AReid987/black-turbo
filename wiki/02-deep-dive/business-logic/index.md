# Business Logic

This page documents the authentication system, session management, rate limiting, invite code system, and URL state management that form the operational core of BLACKTIVISM.

---

## Authentication Flow — Complete State Machine

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
stateDiagram-v2
    [*] --> Unauthenticated: Browser visits /

    Unauthenticated --> TriggerDetected: Konami code entered<br>OR copyright clicked 5x<br>OR navigate to /login

    TriggerDetected --> AuthModalOpen: HiddenAuth or CovertLogin modal shown

    AuthModalOpen --> RateLimited: 5+ failed attempts in 15 min
    AuthModalOpen --> Validating: User submits key

    RateLimited --> AuthModalOpen: 15 minute lockout expires

    Validating --> ServerRateCheck: POST /api/auth/validate

    ServerRateCheck --> RateLimitedServer: X-Forwarded-For IP at max
    ServerRateCheck --> KeyValidation: IP allowed

    KeyValidation --> SessionCreated: constantTimeCompare passes
    KeyValidation --> ValidationFailed: Key mismatch

    ValidationFailed --> AuthModalOpen: Error shown<br>attempt recorded

    SessionCreated --> Authenticated: Set-Cookie shadow_session<br>Redirect /dashboard

    Authenticated --> SessionExpired: Date.now() > expiry (1h default)
    Authenticated --> LoggedOut: User clicks EXIT<br>Cookie cleared

    SessionExpired --> Unauthenticated: Redirect /
    LoggedOut --> Unauthenticated: Redirect /
```

---

## Key Validation — Constant-Time Comparison

The core security primitive that prevents timing attacks ([`src/lib/auth.ts:34`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/auth.ts#L34)):

```ts
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false  // length leak is acceptable — attacker already knows key format
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)  // XOR each char
  }
  return result === 0  // 0 = all chars matched
}
```

**Why this matters**: A naive `===` string comparison short-circuits on the first mismatch. An attacker can measure response time to enumerate valid key prefixes character by character. XOR-based comparison always processes all characters.

---

## Session Token Structure

Sessions are AES-encrypted with `ENCRYPTION_KEY` ([`src/lib/auth.ts:48`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/auth.ts#L48)):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph LR
    subgraph Plaintext["Plaintext (before encryption)"]
        P1["keyHash: SHA256(key + SECRET_KEY)"]
        P2["timestamp: Date.now()"]
        P3["expiry: timestamp + SESSION_DURATION"]
    end
    subgraph Encrypted["Encrypted Cookie Value"]
        ENC["AES.encrypt(JSON.stringify(sessionData), ENCRYPTION_KEY)"]
    end
    subgraph Cookie["HTTP Cookie"]
        CK["shadow_session = base64(AES_cipher_text)<br>SameSite=Strict, Path=/"]
    end

    Plaintext --> ENC --> Cookie
```

Validation is pure decryption + expiry check:

```ts
const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY)
const sessionData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
if (Date.now() > sessionData.expiry) return false
return true
```

No server-side session store. The encryption key is the source of truth.

---

## Rate Limiting — Dual Layer

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed', 'lineColor': '#4a9eed'}}}%%
sequenceDiagram
    autonumber
    participant UI as HiddenAuth.tsx (Client)
    participant LS as localStorage
    participant API as /api/auth/validate (Server)
    participant MEM as In-memory Map

    UI->>LS: checkRateLimit() — read auth_attempts[]
    LS-->>UI: recentAttempts (last 15 min)
    
    alt >= 5 attempts (client-side)
        UI-->>UI: setIsLocked(true) — show lockout UI
    else attempts OK
        UI->>API: POST { key }
        API->>MEM: checkServerRateLimit(req) — X-Forwarded-For key
        
        alt IP at limit (server-side)
            API-->>UI: 429 Rate limit exceeded
        else IP OK
            API->>API: constantTimeCompare(key, SECRET_KEY)
            API->>MEM: recordServerAttempt(req)
            API->>LS: recordAttempt() via response flag
            API-->>UI: 200 { success } or 401 { error }
        end
    end
```

**Client-side** ([`src/lib/auth.ts:110`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/auth.ts#L110)):
- Tracks timestamps of attempts in `localStorage.auth_attempts`
- Window: 15 minutes
- Max: 5 attempts
- Locks UI immediately on threshold

**Server-side** ([`src/lib/rateLimit.ts:21`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/rateLimit.ts#L21)):
- In-memory `Map<string, AttemptRecord>`
- Keyed by `X-Forwarded-For` IP (falls back to `'anonymous'`)
- Same 5/15-min policy
- Lives for serverless function instance lifetime

> **Caveat**: Server-side rate limiter resets on cold starts in serverless. For production hardening, swap to Redis or KV store.

---

## Invite Code System

A secondary access layer built on top of the master `SECRET_KEY`. Invite codes are ephemeral, server-memory-only ([`src/lib/inviteCodes.ts:1`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/lib/inviteCodes.ts#L1)):

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
erDiagram
    CODE {
        string code "12 chars, alphanumeric, crypto.randomBytes"
        string created_at "ISO timestamp"
        string label "Human-readable name"
        number uses "Incremented on each valid use"
    }
    SET["_validCodes (Set)"] ||--o{ CODE : "tracks"
    MAP["_codeMetadata (Map)"] ||--o{ CODE : "stores meta"
```

Operations:
- `createCode(label)` — generates 12-char random code, adds to `_validCodes`
- `revokeCode(code)` — removes from both `_validCodes` and `_codeMetadata`  
- `validateCode(code)` — checks presence, increments `uses`
- `listCodes()` — admin listing for `/api/codes`

---

## Dashboard State Management

The dashboard uses React `useState` + URL query params for state persistence. No external state library.

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph TD
    subgraph DashboardState["DashboardPage State"]
        S1["activeLayers: Record&lt;string, boolean&gt;<br>Which of 22 layers are on"]
        S2["visualMode: VisualMode<br>'DEFAULT'|'SATELLITE'|'FLIR'|'NVG'|'CRT'"]
        S3["health: HealthMap<br>Per-layer online/degraded/offline"]
        S4["stats: LayerStats<br>Count of entities per layer"]
        S5["activeCamera: CctvCamera | null<br>Currently focused CCTV feed"]
        S6["refreshKey: number<br>Incremented to force data reload"]
    end
    subgraph URLSync["URL Query String"]
        U1["?layers=cctv,satellites,earthquakes"]
        U2["&mode=FLIR"]
    end
    subgraph MapCallback["ShadowbrokerMap Callbacks"]
        C1["onHealthChange(health)"]
        C2["onStatsChange(stats)"]
        C3["onCameraSelect(camera)"]
        C4["onToast(message)"]
    end

    S1 -->|"debounced 300ms"| U1
    S2 -->|"debounced 300ms"| U2
    U1 -->|"on mount"| S1
    U2 -->|"on mount"| S2
    MapCallback --> DashboardState
```

Reference: [`src/app/dashboard/page.tsx:37`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L37)

---

## Logout & Session Clearing

Logout is client-side cookie deletion ([`dashboard/page.tsx:118`](https://github.com/AReid987/shadowbroker-deployment/blob/main/src/app/dashboard/page.tsx#L118)):

```ts
const handleLogout = () => {
  document.cookie = 'shadow_session=; Path=/; Max-Age=0; SameSite=Strict'
  window.location.href = '/'
}
```

Setting `Max-Age=0` tells the browser to immediately expire the cookie. The server never needs to invalidate it — the next request to `/dashboard` will find no cookie and be redirected by the middleware.

---

## Security Layer Summary

```mermaid
%%{init: {'theme': 'dark', 'themeVariables': {'primaryColor': '#1e3a5f', 'primaryTextColor': '#e0e0e0', 'primaryBorderColor': '#4a9eed'}}}%%
graph TD
    subgraph Layer1["L1: Network / Transport"]
        N1["HSTS: 63072000s includeSubDomains preload"]
        N2["CSP: default-src 'self' — blocks data exfil"]
        N3["X-Frame-Options: SAMEORIGIN — no iframe embedding"]
    end
    subgraph Layer2["L2: Route Guard"]
        R1["Next.js Middleware (Edge)<br>/dashboard requires shadow_session cookie"]
        R2["API routes: re-verify session on every request"]
    end
    subgraph Layer3["L3: Authentication"]
        A1["Constant-time key comparison<br>Prevents timing oracle attacks"]
        A2["SHA-256 key hash stored in session<br>Plain key never serialized"]
        A3["AES-256 session encryption<br>Client cannot forge tokens"]
    end
    subgraph Layer4["L4: Rate Limiting"]
        RL1["Client: localStorage 5/15min"]
        RL2["Server: in-memory IP map 5/15min"]
    end
    subgraph Layer5["L5: Operational Security"]
        O1["Decoy page has zero /dashboard references<br>No dashboard JS in unauthenticated bundle"]
        O2["No user data collection<br>No analytics, no logging of keys"]
        O3["Shodan API key server-proxied<br>Never exposed to client bundle"]
    end

    Layer1 --> Layer2 --> Layer3 --> Layer4 --> Layer5
```

<!-- Sources: src/lib/auth.ts:34, src/lib/auth.ts:48, src/lib/rateLimit.ts:21, src/lib/inviteCodes.ts:1, src/app/dashboard/page.tsx:37 -->
