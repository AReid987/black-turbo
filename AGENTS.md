# AGENTS.md — AI Agent Context for shadowbroker-deployment

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **shadowbroker-deployment** (1385 symbols, 2002 relationships, 59 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/shadowbroker-deployment/context` | Codebase overview, check index freshness |
| `gitnexus://repo/shadowbroker-deployment/clusters` | All functional areas |
| `gitnexus://repo/shadowbroker-deployment/processes` | All execution flows |
| `gitnexus://repo/shadowbroker-deployment/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->

---

## Project Summary for AI Agents

**Project**: shadowbroker-deployment (BLACKTIVISM OSINT Platform)  
**Stack**: Next.js 14, React 18, TypeScript 5, Tailwind CSS, MapLibre GL JS  
**Deploy**: Vercel (frontend) + optional Fly.io (backend)  
**Version**: BLACKTIVISM v0.4  

### Architecture in One Paragraph

A dual-identity Next.js application: the root route `/` serves a convincing decoy landing page (absurdist commercial services); the `/dashboard` route serves a real-time geospatial intelligence dashboard. Access to `/dashboard` is protected by a `shadow_session` HTTP cookie set by the `/api/auth/validate` route. Authentication is keyless — no user table — using AES-encrypted session tokens containing expiry timestamps. The map renders 22 togglable data layers (military aircraft, vessels, CCTV feeds, satellites, conflict zones, earthquakes, etc.) from 21+ public data sources via `src/lib/data/*.ts` fetchers.

### Critical Files

| File | Purpose | Risk if Broken |
|------|---------|----------------|
| `src/middleware.ts` | Edge cookie guard for /dashboard | Critical — auth bypass |
| `src/lib/auth.ts` | `validateKey`, `createSession`, `validateSession` | Critical — auth bypass |
| `src/lib/rateLimit.ts` | Server-side rate limiter | High — brute force risk |
| `src/app/api/auth/validate/route.ts` | Key submission endpoint | Critical — auth bypass |
| `src/components/map/ShadowbrokerMap.tsx` | 53KB map engine | High — dashboard unusable |
| `src/components/landing/DecoyLanding.tsx` | Decoy page | Medium — cover story broken |
| `src/lib/utils/fetchWithRetry.ts` | All API fetches depend on this | High — all live data fails |

### Key Environment Variables

```
SECRET_KEY          Master authentication key (never expose in client bundle)
ENCRYPTION_KEY      AES session encryption key (32 chars, never expose)
SESSION_DURATION    1 hour default (milliseconds)
RATE_LIMIT_MAX      5 attempts per window
RATE_LIMIT_WINDOW   900000ms (15 minutes)
SHODAN_API_KEY      Server-only — never prefix NEXT_PUBLIC_
NEXT_PUBLIC_AISTREAM_API_KEY  Client-safe AIS vessel key
```

### Data Layer Pattern

Every `src/lib/data/*.ts` module follows this exact pattern:
1. `fetchWithRetry(URL, {retries: 2, timeout: 8000})`
2. Transform response to typed local interface
3. `setCache(KEY, result)` to localStorage
4. On error: `getCache(KEY) || STATIC_FALLBACK`

### Auth Flow Summary

```
POST /api/auth/validate { key }
→ checkServerRateLimit(req)         [src/lib/rateLimit.ts]
→ constantTimeCompare(key, SECRET_KEY) [src/lib/auth.ts:34]
→ createSession(key)                [src/lib/auth.ts:48]
→ Set-Cookie: shadow_session (AES encrypted, 1h TTL)
→ Redirect to /dashboard
```

### What NOT to Change Without Care

- `constantTimeCompare` function in `src/lib/auth.ts` — timing attack prevention
- Cookie name `shadow_session` — hardcoded in middleware and dashboard logout
- `src: false` in dynamic import of `ShadowbrokerMap` — MapLibre requires browser
- `NEXT_PUBLIC_` prefix decisions — determines what's in client bundle
- Static fallback data in `vessels.ts`, `infrastructure.ts` — curated intelligence data

### Wiki

Full documentation at `wiki/` — VitePress site config at `wiki/.vitepress/config.ts`.
