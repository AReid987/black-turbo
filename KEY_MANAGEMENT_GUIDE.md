# 🔑 Shadowbroker Key Management Guide

## Understanding the Key System

### The Two Keys You Have

1. **SECRET_KEY** (from your `.env` file) - This is your MASTER KEY
   - Anyone with this key can access the system
   - This is what you share with trusted users
   - Keep this secure and never commit to git

2. **ENCRYPTION_KEY** (from your `.env` file) - This is for internal security
   - Used to encrypt/decrypt session tokens
   - You never share this with anyone
   - Only needed by the system itself

## How to Generate Access Keys for Users

### Method 1: Share Your Master Key (Simplest)

The simplest approach is to share your `SECRET_KEY` directly with trusted users:

1. **Find your SECRET_KEY** in the `.env` file:
   ```bash
   cat .env | grep SECRET_KEY
   ```

2. **Share this key securely** (see secure sharing methods below)

3. **User enters this key** in the hidden authentication interface

### Method 2: Use the Key Generation Script

For more sophisticated key management:

```bash
node scripts/generate-key.js
```

This gives you an interactive menu:
1. **Generate random access key** - Creates a new unique key
2. **Create user-specific key** - Generates a key tied to a username
3. **Validate existing key** - Test if a key works
4. **Show master key** - Display your SECRET_KEY

### Important Note About the Current Implementation

Right now, the system validates keys against your master `SECRET_KEY`. So when you generate keys using the script, they're essentially variations that still validate against your master secret.

For the current setup, **sharing your master SECRET_KEY is the most straightforward approach**.

## 🔒 How to Share Keys Securely

### NEVER Use These Methods (Insecure):
- ❌ Email (even "encrypted" email)
- ❌ SMS/text messages
- ❌ Slack/Discord/Teams direct messages
- ❌ Google Docs or shared notes
- ❌ Any cloud storage that you don't control
- ❌ QR codes in public places
- ❌ Physical notes left in accessible areas

### SECURE Methods:

#### 1. Encrypted Messaging Apps (Best)
- **Signal** - End-to-end encrypted, messages disappear
- **Session** - No phone number required, fully encrypted
- **Wickr Me** - Self-destructing messages, no metadata
- **Threema** - Swiss-based, no phone number required

**How to do it:**
```
You: "Here's your access key for the spreadsheet system: [paste key]"
User: "Got it, thanks!"
You: 🗑️ (Delete the message immediately after)
```

#### 2. In-Person (Most Secure)
- Write it on a piece of paper
- Hand it directly to the person
- Watch them enter it
- Destroy the paper afterward

#### 3. Password Manager Sharing
- Use 1Password, Bitwarden, or similar
- Use their secure sharing feature
- Set to auto-expire after first use

#### 4. One-Time Secret Services
- Use services like `onetimesecret.com`
- Set the link to expire after viewing
- Still less secure than Signal/Session, but better than email

#### 5. Physical Security Key (Advanced)
- Use a YubiKey or similar hardware token
- Store the key on the device
- User must have physical access to the token

## 🔄 How to Revoke Access

### Immediate Revocation (All Users)

If a key is compromised or you need to lock everyone out:

1. **Generate a new SECRET_KEY**:
   ```bash
   openssl rand -hex 32
   ```

2. **Update your `.env` file**:
   ```env
   SECRET_KEY=new-generated-key-here
   ```

3. **Restart your application**:
   ```bash
   # If running locally
   npm run dev

   # If deployed to Vercel
   vercel env rm SECRET_KEY
   vercel env add SECRET_KEY
   vercel deploy --prod
   ```

4. **Generate new keys** for authorized users

### Selective Revocation

Currently, the system uses a single master key, so you can't revoke individual users without revoking everyone. This is by design for maximum privacy - no user tracking means no selective revocation.

If you need individual user control, you'd need to modify the authentication system to support multiple keys.

## 🛡️ Security Best Practices

### Key Storage
- ✅ Store `.env` file locally, never commit to git
- ✅ Use environment variables in production
- ✅ Keep backup copies in encrypted storage
- ❌ Never hardcode keys in source code
- ❌ Never include keys in screenshots
- ❌ Never share keys in public repositories

### Key Sharing
- ✅ Use end-to-end encrypted messaging
- ✅ Share in person when possible
- ✅ Use self-destructing messages
- ❌ Never send via email
- ❌ Never post in chat apps
- ❌ Never write on shared whiteboards

### Key Rotation
- ✅ Rotate keys every 3-6 months
- ✅ Rotate immediately if compromised
- ✅ Use strong random generation
- ❌ Don't use predictable patterns
- ❌ Don't reuse old keys

## 🚨 Emergency Procedures

### If a Key is Compromised

1. **Immediate Action**: Rotate your SECRET_KEY immediately
2. **Notify Users**: Let authorized users know they need new keys
3. **Audit Access**: Check logs for unusual activity (if available)
4. **Document**: Record when and why the rotation happened

### If You Lose Your Keys

1. **Check Backups**: Look for encrypted backups of `.env`
2. **Check Password Managers**: If you stored it there
3. **Regenerate**: Create new keys and update all systems
4. **Notify Users**: Everyone will need new access keys

## 📋 Key Management Checklist

### When Onboarding a New User:
- [ ] Verify their identity through a secure channel
- [ ] Share the key using an encrypted messaging app
- [ ] Confirm they received and can access the system
- [ ] Delete the message containing the key
- [ ] Document access (privately, for your records)

### When Offboarding a User:
- [ ] Rotate your master SECRET_KEY
- [ ] Generate new keys for remaining authorized users
- [ ] Share new keys securely
- [ ] Confirm old access no longer works

### Regular Maintenance:
- [ ] Monthly: Review who has access
- [ ] Quarterly: Rotate encryption keys
- [ ] Bi-annually: Full security audit
- [ ] Annually: Review and update security procedures

## 🔐 Advanced: Setting Up Individual User Keys

If you want to move beyond the single master key system, you can modify the authentication to support multiple keys:

1. Create a `keys.json` file with valid user keys:
   ```json
   {
     "user1": "hashed-key-1",
     "user2": "hashed-key-2"
   }
   ```

2. Modify `src/lib/auth.ts` to check against this file

3. Add admin endpoints to add/remove keys

This gives you individual user control but requires maintaining a keys database.

## 💡 Pro Tips

1. **Use Key Phrases**: Instead of random strings, use memorable phrases like "BlueMonday2024!Spreadsheet"
2. **Set Expiration**: Consider implementing time-limited keys
3. **Use Context**: Make keys somewhat related to the user so they're harder to forget
4. **Backup Securely**: Encrypt your `.env` file before backing up
5. **Test Everything**: Always test new keys before sharing them

---

**Remember**: The security of your entire system depends on how well you protect these keys. Treat them like the keys to your house - because in a way, they are!