# 🔑 Quick Key Sharing Guide

## The Simple Answer

For your current setup, **just share your SECRET_KEY** from your `.env` file. That's it!

## How to Find Your Key

```bash
# In your project directory
cat .env | grep SECRET_KEY
```

You'll see something like:
```
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

## Share This Key Securely

### BEST: Encrypted Messaging Apps
- **Signal** (most recommended)
- **Session** (no phone number needed)
- **Wickr Me** (messages disappear)

**How:**
1. Open Signal/Session/Wickr
2. Paste the key: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
3. Send it
4. **Delete the message immediately** after they confirm receipt

### GOOD: In-Person
1. Write it on paper
2. Hand it to them
3. Watch them enter it
4. Destroy the paper

### OKAY: One-Time Secret Link
- Use `onetimesecret.com`
- Paste the key
- Send the link
- Link expires after first view

## NEVER Share Via:
- ❌ Email
- ❌ SMS/text
- ❌ Slack/Discord
- ❌ Google Docs
- ❌ Any cloud storage
- ❌ Screenshot

## What the User Does

1. They visit your site
2. They use the hidden auth (click copyright 5x or Konami code)
3. They paste the key you shared
4. They're in!

## If You Need to Lock Everyone Out

1. Generate a new SECRET_KEY:
   ```bash
   openssl rand -hex 32
   ```

2. Update your `.env` file with the new key

3. Restart your app:
   ```bash
   # Stop and restart
   npm run dev
   ```

4. Everyone needs a new key now!

## Pro Tips

- **Test the key yourself first** - make sure it works before sharing
- **Tell them it's case-sensitive** - keys are exact matches
- **Have them screenshot their success** - so they know it worked
- **Write down who you gave it to** - for your own records (privately)

## Emergency: If Key Gets Compromised

1. Immediately generate a new SECRET_KEY
2. Update `.env` and restart
3. Share new keys with trusted people only
4. The old key is now useless

---

**Remember**: Your SECRET_KEY is like a physical key to your house. Only give it to people you trust completely!