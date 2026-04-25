# 🕵️ Shadowbroker Covert Deployment - Quick Reference

## 🚀 One-Command Setup

```bash
git clone <your-repo> && cd shadowbroker-deployment && chmod +x setup.sh && ./setup.sh
```

## 🔑 Key Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### Key Management
```bash
node scripts/generate-key.js    # Interactive key management
```

### Deployment
```bash
vercel deploy                    # Deploy to Vercel
vercel env add SECRET_KEY        # Add environment variable
vercel logs                      # View deployment logs
```

## 🎯 Hidden Access Methods

1. **Copyright Trigger**: Click copyright text 5x within 3 seconds
2. **Konami Code**: ↑↑↓↓←→←→BA
3. **Direct URL**: `https://your-domain.com/login`

## 🔐 Environment Variables

```env
SECRET_KEY=your-master-key-here              # Master access key
ENCRYPTION_KEY=your-encryption-key-here      # Session encryption
BACKEND_URL=https://your-backend.com         # Shadowbroker API
SESSION_DURATION=3600000                     # 1 hour in ms
RATE_LIMIT_MAX=5                             # Max attempts
RATE_LIMIT_WINDOW=900000                     # 15 min window
```

## 🛡️ Security Features

- ✅ No user data collection
- ✅ Ephemeral sessions (1 hour)
- ✅ Rate limiting (5 attempts/15 min)
- ✅ Auto lockout (15 min)
- ✅ HTTP-only cookies
- ✅ Timing attack prevention
- ✅ Security headers

## 📋 Deployment Checklist

- [ ] Run `./setup.sh`
- [ ] Save `SECRET_KEY` securely
- [ ] Test hidden auth locally
- [ ] Deploy to Vercel
- [ ] Set env variables in Vercel
- [ ] Test production deployment
- [ ] Generate user keys
- [ ] Share keys securely

## 🚨 Emergency Commands

### Lock All Users
```bash
# Rotate SECRET_KEY in .env
# Redeploy immediately
vercel deploy --prod
```

### Check Failed Attempts
```bash
# Monitor Vercel logs for auth failures
vercel logs --follow
```

## 📊 File Structure

```
shadowbroker-deployment/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Decoy landing page
│   │   ├── dashboard/        # Protected Shadowbroker
│   │   └── api/auth/         # Auth endpoints
│   ├── components/auth/      # Hidden auth component
│   ├── lib/auth.ts           # Authentication logic
│   └── middleware.ts         # Route protection
├── scripts/
│   └── generate-key.js       # Key management
├── .env                      # Environment variables
├── vercel.json              # Vercel config
└── package.json             # Dependencies
```

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access hidden auth | Try Konami code: ↑↑↓↓←→←→BA |
| Invalid key error | Verify SECRET_KEY matches generation |
| Rate limited | Wait 15 minutes or clear localStorage |
| Build fails | Check env variables in Vercel dashboard |
| Session expires | Default 1 hour, adjust SESSION_DURATION |

## 📱 Quick Key Generation

```bash
# Generate random key
node scripts/generate-key.js
# Select option 1

# Generate user-specific key
node scripts/generate-key.js
# Select option 2, enter username

# Validate key
node scripts/generate-key.js
# Select option 3, paste key to test
```

## 🎯 Success Indicators

✅ Decoy page loads and looks professional
✅ Hidden auth reveals with secret trigger
✅ Valid key grants dashboard access
✅ Invalid key shows error message
✅ Sessions expire after timeout
✅ No user data is collected
✅ Shadowbroker functions in protected area

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review Vercel deployment logs
3. Verify environment variables are set
4. Test authentication flow in development mode

---

**Remember**: Keep your `SECRET_KEY` secure and never share it publicly!