# Shadowbroker Covert Deployment Guide

Complete guide for deploying the Shadowbroker OSINT platform with covert authentication to Vercel.

## 🎯 Overview

This deployment transforms the Shadowbroker OSINT platform into a covert system hidden behind a convincing decoy landing page for the "International Association of Spreadsheet Enthusiasts" - a completely fake organization that appears legitimate to casual observers.

## 🔐 Authentication System

### How It Works

1. **Public Face**: A professional-looking website for spreadsheet enthusiasts
2. **Hidden Access**: Multiple secret methods to reveal the authentication interface
3. **Key-Based Auth**: Users must possess a secret key to access the real system
4. **No User Data**: No accounts, no personal information, complete anonymity
5. **Admin Control**: Only you can create and distribute keys

### Hidden Access Methods

1. **Copyright Trigger**: Click the copyright text 5 times within 3 seconds
2. **Konami Code**: ↑↑↓↓←→←→BA on any page
3. **Direct URL**: `/login` (though this is less hidden)

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Clone this deployment structure
git clone <your-repo-url>
cd shadowbroker-deployment

# Run setup script
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment

The setup script will create a `.env` file with secure random keys:

```env
SECRET_KEY=your-generated-secret-key
ENCRYPTION_KEY=your-generated-encryption-key
BACKEND_URL=https://your-shadowbroker-backend.com
```

**IMPORTANT**: Save the `SECRET_KEY` securely - this is your master key!

### 3. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` and test the hidden authentication.

### 4. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Set environment variables in Vercel dashboard
# SECRET_KEY, ENCRYPTION_KEY, BACKEND_URL
```

## 🔑 Key Management

### Generate Access Keys

Use the included key management script:

```bash
node scripts/generate-key.js
```

Options:
1. Generate random access key
2. Create user-specific key
3. Validate existing key
4. Show master key
5. Exit

### Sharing Keys Securely

1. **Never share keys via email or plain text**
2. **Use encrypted messaging** (Signal, Wickr, etc.)
3. **Share in person** when possible
4. **Consider one-time keys** for temporary access

### Revoking Access

To revoke access:
1. Rotate your `SECRET_KEY` in `.env`
2. Redeploy to Vercel
3. Generate new keys for authorized users
4. All old keys become invalid

## 🎨 Customizing the Decoy

### Changing the Fake Organization

Edit `src/app/page.tsx` to modify:
- Organization name and branding
- Content and messaging
- Visual design
- Fake testimonials and events

### Alternative Decoy Ideas

- "Cat Tax Calculation Service"
- "International Association of Nap Enthusiasts"
- "Professional Email Forwarders Guild"
- "Society for the Advancement of Left-Handed Scissors"

## 🔒 Security Features

### Implemented

- **No user data storage**
- **Ephemeral sessions** (1 hour default)
- **Rate limiting** (5 attempts per 15 minutes)
- **Automatic lockout** after 5 failed attempts
- **Secure HTTP-only cookies**
- **CSRF protection**
- **Security headers**
- **Constant-time key comparison** (prevents timing attacks)

### Best Practices

1. **Rotate keys regularly**
2. **Monitor access logs** (Vercel provides this)
3. **Use HTTPS only** (enforced in production)
4. **Keep dependencies updated**
5. **Review security headers regularly**

## 🛠️ Integrating Shadowbroker

### Method 1: Direct Integration

1. Copy Shadowbroker frontend code to `src/app/dashboard/`
2. Update API endpoints to point to your backend
3. Configure environment variables for external APIs

### Method 2: iframe Embedding

```tsx
// In src/app/dashboard/page.tsx
<iframe
  src={process.env.BACKEND_URL}
  className="w-full h-screen border-0"
  allow="accelerometer; camera; geolocation; microphone"
/>
```

### Method 3: API Proxy

Create API routes that proxy requests to your Shadowbroker backend:

```tsx
// src/app/api/proxy/route.ts
export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL;
  // Proxy logic here
}
```

## 📊 Monitoring and Maintenance

### Vercel Analytics

Enable Vercel Analytics for usage insights:

```bash
vercel analytics enable
```

### Log Monitoring

Monitor Vercel logs for:
- Failed authentication attempts
- Unusual access patterns
- Error rates
- Performance metrics

### Regular Tasks

- Weekly: Review access logs
- Monthly: Rotate encryption keys
- Quarterly: Update dependencies
- As needed: Revoke compromised keys

## 🚨 Troubleshooting

### Authentication Issues

**Problem**: Users can't log in with valid keys

**Solutions**:
1. Check `SECRET_KEY` matches between generation and validation
2. Verify environment variables are set in Vercel
3. Clear browser cookies and localStorage
4. Check rate limiting hasn't locked the account

### Deployment Issues

**Problem**: Build fails on Vercel

**Solutions**:
1. Check all environment variables are set
2. Verify `package.json` scripts are correct
3. Review build logs in Vercel dashboard
4. Ensure Node.js version compatibility

### Performance Issues

**Problem**: Slow loading or timeouts

**Solutions**:
1. Enable Vercel Edge Functions
2. Optimize images and assets
3. Implement caching strategies
4. Consider upgrading Vercel plan

## 📱 Advanced Configuration

### Custom Session Duration

```env
# In .env file
SESSION_DURATION=7200000  # 2 hours in milliseconds
```

### Rate Limiting

```env
RATE_LIMIT_MAX=10         # Max attempts
RATE_LIMIT_WINDOW=600000  # 15 minutes in milliseconds
```

### Custom Domain

1. Add custom domain in Vercel dashboard
2. Update DNS settings
3. SSL certificate is automatic

## 🎯 Success Criteria

Your deployment is successful when:

- [x] Decoy page looks convincing and loads quickly
- [x] Hidden authentication works reliably
- [x] Keys grant access to protected dashboard
- [x] Invalid keys are rejected with appropriate feedback
- [x] Rate limiting prevents brute force attacks
- [x] Sessions expire appropriately
- [x] Shadowbroker loads and functions correctly
- [x] No user data is collected or stored

## 🔐 Security Checklist

Before going live:

- [ ] Changed default keys in `.env`
- [ ] Enabled HTTPS only
- [ ] Configured rate limiting
- [ ] Set up log monitoring
- [ ] Tested authentication flow
- [ ] Verified session expiration
- [ ] Confirmed no data collection
- [ ] Reviewed security headers
- [ ] Tested key revocation process
- [ ] Established secure key sharing method

## 📞 Support and Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Shadowbroker Repo**: https://github.com/BigBodyCobain/Shadowbroker
- **Security Best Practices**: https://owasp.org/

## 🎉 Congratulations!

You now have a covert OSINT deployment that:
- Looks completely innocent to outsiders
- Provides secure access only to authorized individuals
- Collects zero user data
- Maintains your ability to control access
- Can be deployed globally via Vercel

Remember: With great power comes great responsibility. Use this system ethically and legally.