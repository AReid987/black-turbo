# Shadowbroker Covert Deployment

A covert Vercel deployment of the Shadowbroker OSINT platform with hidden authentication.

## The Concept

**Public Face**: "International Association of Spreadsheet Enthusiasts" - A completely legitimate-looking organization dedicated to the appreciation of spreadsheet formatting and cell optimization techniques.

**Hidden Reality**: Behind the scenes lies the Shadowbroker OSINT platform, accessible only to those with the secret key.

## Authentication System

- No user accounts or personal data collection
- Single key-based authentication
- Key creator has complete control over access
- Users remain completely anonymous
- Revocation by key rotation

## Deployment Structure

```
shadowbroker-deployment/
├── public/                    # Decoy landing page assets
├── src/
│   ├── app/
│   │   ├── page.tsx          # Decoy landing page
│   │   ├── login/            # Hidden authentication
│   │   └── dashboard/        # Protected Shadowbroker app
│   ├── components/
│   │   ├── decoy/            # Fake components
│   │   └── auth/             # Hidden auth components
│   └── lib/
│       ├── auth.ts           # Key validation
│       └── keys.ts           # Key management
├── api/                      # Vercel serverless functions
├── vercel.json              # Deployment config
└── .env.example             # Environment variables
```

## Setup Instructions

1. Clone this deployment structure alongside your Shadowbroker repository
2. Copy Shadowbroker frontend code into `src/app/dashboard/`
3. Set up your secret key in environment variables
4. Deploy to Vercel

## The Hidden Access Method

The decoy page contains a seemingly innocent element that reveals the authentication interface when interacted with in a specific way.

## Security Features

- No user data storage
- Ephemeral authentication sessions
- Key rotation capability
- Rate limiting on auth attempts
- No identifiable information collection
