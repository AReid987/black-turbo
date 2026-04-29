# Shadowbroker Refactored Deployment Guide

## Architecture

- **Frontend (Subterfuge)**: Next.js 14 app deployed to **Vercel**
- **Backend (Shadowbroker OSINT)**: Deployed to **Fly.io** (recommended for 24/7 free tier)

## Platform Recommendation

**Fly.io wins for 24/7 backend hosting:**
- Free tier: ~$5/mo credit
- Shared CPU 256MB machine: ~$1.94/mo (runs 24/7 within free credit)
- Automatic HTTPS, global edge routing
- Native Docker support

Railway free tier gives 500 execution hours/mo — not enough for true 24/7 (needs ~720 hrs).

---

## Frontend Deployment (Vercel)

### Prerequisites

1. Vercel account connected to GitHub
2. Project linked to this repo
3. Environment variables configured in Vercel dashboard or via GitHub Secrets

### Required Secrets

Set these in **GitHub Secrets** (for CI/CD) or **Vercel Dashboard**:

| Secret | Description |
|--------|-------------|
| `SECRET_KEY` | Master auth key for generating access keys |
| `ENCRYPTION_KEY` | 32-char session encryption key |
| `BACKEND_URL` | URL of your Fly.io backend (e.g., `https://shadowbroker-backend.fly.dev`) |
| `SESSION_DURATION` | Session TTL in ms (default: `3600000`) |
| `RATE_LIMIT_MAX` | Max auth attempts (default: `5`) |
| `RATE_LIMIT_WINDOW` | Rate limit window in ms (default: `900000`) |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID (`team_DE0eCny4qE63Df3PfvvH4cCR`) |
| `VERCEL_PROJECT_ID` | Vercel project ID (`prj_INQCJ4C9kwIHMZJfaeltTlx3TDbh`) |

### Deploy via GitHub Actions

Pushes to `main` auto-deploy to production via `.github/workflows/deploy-vercel.yml`.

Preview deployments run on pull requests.

### Current Production URL

**https://subterfuge-shadowbroker-gggg1rct6-aigency0.vercel.app**

### Project Details

- **Vercel Team**: `aigency0`
- **Project Name**: `subterfuge-shadowbroker`
- **Production URL**: https://subterfuge-shadowbroker-524m9kmf7-aigency0.vercel.app
- **Org ID**: `team_DE0eCny4qE63Df3PfvvH4cCR`
- **Project ID**: `prj_INQCJ4C9kwIHMZJfaeltTlx3TDbh`

### Manual Deploy

```bash
npm i -g vercel
vercel --prod
```

> **Note**: Vercel Deployment Protection is enabled for this team project. You may need to disable it in the Vercel dashboard (Settings → Deployment Protection) or use a bypass token for public access.

---

## Backend Deployment (Fly.io)

### Prerequisites

1. [Install `flyctl`](https://fly.io/docs/hands-on/install-flyctl/)
2. Run `fly auth login`

### Steps

1. **Update `fly.toml`**:
   - Change `app = 'shadowbroker-backend'` to your desired app name
   - Adjust `internal_port` to match your backend's listening port
   - Uncomment/set the appropriate `[build]` section for your stack

2. **Create the app**:
   ```bash
   fly apps create shadowbroker-backend
   ```

3. **Set secrets**:
   ```bash
   fly secrets set DATABASE_URL=... API_KEY=... --app shadowbroker-backend
   ```

4. **Deploy**:
   ```bash
   fly deploy
   ```

5. **Scale to 1 machine for 24/7**:
   ```bash
   fly scale count 1 --app shadowbroker-backend
   ```

### Cost Estimate

| Resource | Cost |
|----------|------|
| Shared CPU 256MB | ~$1.94/mo |
| 3GB volume (if needed) | ~$0.15/mo |
| **Total** | **~$2.09/mo** |

Well within Fly.io's $5/mo free tier.

---

## Post-Deployment Checklist

- [ ] Frontend builds and deploys to Vercel without errors
- [ ] Backend deploys to Fly.io and responds to health checks
- [ ] `BACKEND_URL` in frontend env points to Fly.io app
- [ ] Authentication flow works end-to-end
- [ ] Rate limiting active
- [ ] Session cookies secure in production
- [ ] Custom domain configured (optional)

---

## Troubleshooting

### GSD v2 Startup Issues

GSD was defaulting to OpenRouter with insufficient credits. Fixed by switching provider to **Mistral** (`mistral-large-latest`) using valid `MISTRAL_API_KEY`.

Config location: `~/.gsd/agent/settings.json`

If you need to switch providers later:
```bash
gsd --list-models <provider>  # list available models
gsd config                    # interactive setup wizard
```

### Build Failures

If `npm run build` fails with crypto-js type errors:
```bash
npm install --save-dev @types/crypto-js
```

### Fly.io 502 Errors

Ensure your backend binds to `0.0.0.0` (not `127.0.0.1`) and the port matches `fly.toml` `internal_port`.
