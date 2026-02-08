# 🚀 Complete Deployment Steps - Full Checklist

Follow these steps in order to deploy your application to a live URL.

---

## 📋 Pre-Deployment Checklist

- [x] ✅ Node.js installed (v25.2.1)
- [x] ✅ npm installed (v11.6.2)
- [x] ✅ Dependencies installed (`npm install`)
- [x] ✅ Git repository initialized
- [x] ✅ Code committed
- [x] ✅ Build verified (`npm run build` successful)
- [ ] ⬜ Git identity configured
- [ ] ⬜ GitHub repository created
- [ ] ⬜ Code pushed to GitHub
- [ ] ⬜ Vercel account created
- [ ] ⬜ Project deployed to Vercel
- [ ] ⬜ Environment variables configured
- [ ] ⬜ Application tested live

---

## Step 1: Configure Your Git Identity

**Why:** So your commits show your real name/email on GitHub.

**Commands:**
```powershell
# Set your name (use your real name or GitHub username)
git config --global user.name "Your Name"

# Set your email (must match your GitHub account email)
git config --global user.email "your.email@example.com"

# Verify it's set correctly
git config user.name
git config user.email
```

**Example:**
```powershell
git config --global user.name "Marti"
git config --global user.email "marti@example.com"
```

---

## Step 2: Create GitHub Repository

**Why:** Need a place to store your code online.

**Steps:**
1. Go to: **https://github.com/new**
2. **Repository name**: `cedula` (or any name you like)
3. **Description** (optional): "Cédula de Habitabilidad Checker"
4. **Visibility**: 
   - Choose **Public** (free, anyone can see)
   - Or **Private** (only you can see)
5. **DO NOT** check any of these boxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
6. Click **"Create repository"**

**Result:** You'll see a page with setup instructions (you can ignore most of it).

---

## Step 3: Connect Local Repository to GitHub

**Why:** Link your local code to the GitHub repository.

**Commands:**
```powershell
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cedula.git

# Rename branch to 'main' (GitHub's default)
git branch -M main

# Verify remote is added
git remote -v
```

**Example:**
```powershell
git remote add origin https://github.com/marti/cedula.git
git branch -M main
```

**If you get "remote origin already exists" error:**
```powershell
# Remove existing remote
git remote remove origin

# Add it again with correct URL
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
```

---

## Step 4: Push Code to GitHub

**Why:** Upload your code to GitHub so Vercel can access it.

**Commands:**
```powershell
# Push code to GitHub
git push -u origin main
```

**Authentication Options:**

**Option A: Personal Access Token (Recommended)**
1. If prompted for password, you need a Personal Access Token
2. Go to: **https://github.com/settings/tokens**
3. Click **"Generate new token"** → **"Generate new token (classic)"**
4. Name it: "Vercel Deployment"
5. Select scopes: Check **"repo"** (full control)
6. Click **"Generate token"**
7. **Copy the token** (you won't see it again!)
8. When Git asks for password, paste the token instead

**Option B: GitHub CLI (Alternative)**
```powershell
# Install GitHub CLI
# Then authenticate
gh auth login
```

**Expected Output:**
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Writing objects: 100% (50/50), done.
To https://github.com/YOUR_USERNAME/cedula.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**Verify:** Go to your GitHub repository page - you should see all your files!

---

## Step 5: Create Vercel Account

**Why:** Vercel will host your application for free.

**Steps:**
1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Complete signup (if needed)

**Result:** You'll be in the Vercel dashboard.

---

## Step 6: Deploy Project to Vercel

**Why:** Make your app live on the internet.

**Steps:**

1. **In Vercel Dashboard:**
   - Click **"Add New Project"** button

2. **Import Repository:**
   - You should see your `cedula` repository
   - Click **"Import"** next to it

3. **Configure Project:**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)
   - **Leave everything else as default**

4. **Click "Deploy"** (don't add environment variables yet - we'll do that next)

5. **Wait 2-3 minutes** for deployment to complete

**Result:** You'll get a URL like `https://cedula-xxxxx.vercel.app` (but it won't work yet without environment variables)

---

## Step 7: Configure Environment Variables

**Why:** Your app needs secrets to work (authentication, etc.).

**Steps:**

1. **Generate Secure Secret:**
   ```powershell
   # Run this in PowerShell to generate a secure random string
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```
   
   **Or use online:** https://generate-secret.vercel.app/32
   
   **Copy the generated string** (you'll need it)

2. **In Vercel Dashboard:**
   - Go to your project
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in sidebar
   - Add these variables one by one:

   **Variable 1:**
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: (paste the generated secret from step 1)
   - **Environments**: Check all (Production, Preview, Development)
   - Click **"Save"**

   **Variable 2:**
   - **Key**: `NEXTAUTH_URL`
   - **Value**: `https://your-project-name.vercel.app` (use your actual Vercel URL)
   - **Environments**: Check all
   - Click **"Save"**

   **Variable 3 (Optional - for Google OAuth):**
   - **Key**: `GOOGLE_CLIENT_ID`
   - **Value**: (your Google OAuth client ID - if you have one)
   - **Environments**: Check all
   - Click **"Save"**

   **Variable 4 (Optional - for Google OAuth):**
   - **Key**: `GOOGLE_CLIENT_SECRET`
   - **Value**: (your Google OAuth client secret - if you have one)
   - **Environments**: Check all
   - Click **"Save"**

3. **Redeploy:**
   - Go to **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - Wait 2-3 minutes

**Result:** Your app should now work!

---

## Step 8: Test Your Live Application

**Why:** Make sure everything works before sharing.

**Checklist:**
- [ ] Visit your Vercel URL: `https://your-project.vercel.app`
- [ ] Home page loads correctly
- [ ] Form submission works
- [ ] Go to `/auth/signup` - create an account
- [ ] Go to `/auth/signin` - sign in works
- [ ] Dashboard loads (`/dashboard`)
- [ ] Create a test case
- [ ] View case details
- [ ] Test file upload (if applicable)

**If something doesn't work:**
- Check Vercel deployment logs (in dashboard)
- Check browser console for errors
- Verify environment variables are set correctly

---

## Step 9: Add Custom Domain (Optional)

**Why:** Use your own domain instead of `vercel.app` subdomain.

**Steps:**

1. **In Vercel Dashboard:**
   - Go to your project → **"Settings"** → **"Domains"**
   - Enter your domain (e.g., `cedula-checker.com`)
   - Click **"Add"**

2. **Configure DNS:**
   - Vercel will show you DNS instructions
   - Go to your domain registrar (where you bought the domain)
   - Add DNS records as instructed:
     - **CNAME**: `www` → `cname.vercel-dns.com`
     - **A Record**: `@` → (IP addresses provided by Vercel)

3. **Wait for DNS Propagation:**
   - Can take up to 24 hours (usually 1-2 hours)
   - Check status in Vercel dashboard

4. **Update Environment Variable:**
   - Update `NEXTAUTH_URL` to your custom domain
   - Redeploy

**Result:** Your app will be accessible at your custom domain!

---

## Step 10: Share Your Application! 🎉

**Your app is now live!**

**Share these:**
- **Main URL**: `https://your-project.vercel.app`
- **Custom Domain** (if configured): `https://yourdomain.com`

**Features:**
- ✅ HTTPS (automatic)
- ✅ SSL Certificate (free)
- ✅ Auto-deploys on every git push
- ✅ Free tier includes:
  - Unlimited deployments
  - Custom domains
  - 100GB bandwidth/month

---

## 🔄 Future Updates

**To update your live app:**

1. Make changes to your code
2. Commit changes:
   ```powershell
   git add .
   git commit -m "Description of changes"
   git push
   ```
3. **Vercel automatically deploys** on every push!
4. Wait 2-3 minutes
5. Your changes are live!

---

## 🆘 Troubleshooting

### Problem: "Repository not found" when pushing
**Solution:**
- Check GitHub username is correct
- Make sure repository exists on GitHub
- Use Personal Access Token for authentication

### Problem: Build fails on Vercel
**Solution:**
- Check build logs in Vercel dashboard
- Verify `NEXTAUTH_SECRET` is set
- Make sure all environment variables are added

### Problem: Authentication not working
**Solution:**
- Verify `NEXTAUTH_URL` matches your Vercel URL exactly
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Redeploy after changing environment variables

### Problem: "Port 3000 already in use" (local)
**Solution:**
```powershell
# Use different port
npm run dev -- -p 3001
```

### Problem: Can't push to GitHub
**Solution:**
- Use Personal Access Token instead of password
- Or set up SSH keys
- Check you have write access to repository

---

## 📝 Quick Reference Commands

```powershell
# Check git status
git status

# See commit history
git log --oneline

# Push updates
git add .
git commit -m "Your message"
git push

# Check environment variables (local)
# Create .env.local file with:
# NEXTAUTH_SECRET=your-secret
# NEXTAUTH_URL=http://localhost:3000

# Build locally
npm run build

# Run production build locally
npm start
```

---

## ✅ Final Checklist

Before sharing your app, verify:

- [ ] Git identity configured
- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] Environment variables set
- [ ] App loads at Vercel URL
- [ ] Authentication works
- [ ] Can create accounts
- [ ] Can create cases
- [ ] All features tested
- [ ] Custom domain configured (optional)

---

## 🎯 You're Done!

Your application is now:
- ✅ Live on the internet
- ✅ Accessible via URL
- ✅ Ready to share
- ✅ Auto-deploying on updates
- ✅ Free to use (Vercel free tier)

**Congratulations! 🎉**
