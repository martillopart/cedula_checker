# 🚀 Quick Deploy Guide - Get Live in 5 Minutes

## Fastest Method: Vercel

### Step 1: Push to GitHub (2 minutes)

```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Ready to deploy"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Vercel (3 minutes)

1. **Go to**: https://vercel.com/signup
2. **Sign up** with your GitHub account
3. **Click "Add New Project"**
4. **Import** your `cedula` repository
5. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these:
     ```
     NEXTAUTH_SECRET=generate-this-with-openssl-rand-base64-32
     NEXTAUTH_URL=https://your-project-name.vercel.app
     ```
6. **Click "Deploy"**

### Step 3: Get Your URL

After deployment (2-3 minutes), you'll get:
- **Live URL**: `https://your-project-name.vercel.app`
- **Automatic HTTPS**: ✅
- **Free SSL**: ✅

### Step 4: Add Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `cedula-checker.com`)
3. Follow DNS instructions
4. Update `NEXTAUTH_URL` to your custom domain
5. Redeploy

---

## Generate Secure Secret

**Windows PowerShell:**
```powershell
# Generate a secure random secret
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Or use online**: https://generate-secret.vercel.app/32

---

## Environment Variables Needed

```
NEXTAUTH_SECRET=<generate-secure-random-string>
NEXTAUTH_URL=https://your-domain.com

# Optional: Google OAuth
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
```

---

## That's It! 🎉

Your app is now live and shareable!

**Next Steps:**
- Share your URL with users
- Set up Google OAuth (optional)
- Add custom domain (optional)
- Monitor usage in Vercel dashboard

---

## Other Quick Options

- **Netlify**: Similar to Vercel, also free
- **Railway**: $5/month, good for apps needing databases
- **Render**: Free tier available

See `DEPLOYMENT.md` for detailed instructions on all platforms.
