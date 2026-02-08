# PowerShell Commands - Deploy to Get Working URL

Copy and paste these commands in order. Replace placeholders with your actual information.

---

## Step 1: Configure Git Identity

```powershell
# Set your name (replace "Your Name" with your actual name or GitHub username)
git config --global user.name "Your Name"

# Set your email (replace with your GitHub email)
git config --global user.email "your.email@example.com"

# Verify it's set correctly
git config user.name
git config user.email
```

---

## Step 2: Create GitHub Repository (Manual Step)

**You need to do this in a browser first:**

1. Go to: https://github.com/new
2. Repository name: `cedula`
3. Choose Public or Private
4. **DO NOT** check README, .gitignore, or license
5. Click "Create repository"
6. **Copy your repository URL** (e.g., `https://github.com/YOUR_USERNAME/cedula.git`)

---

## Step 3: Connect to GitHub and Push

```powershell
# Navigate to project directory (if not already there)
cd C:\Users\marti\Desktop\cedula

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/cedula.git

# If you get "remote origin already exists", remove it first:
# git remote remove origin
# git remote add origin https://github.com/YOUR_USERNAME/cedula.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your GitHub password)
  - Get token from: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Select "repo" scope
  - Copy the token and use it as password

---

## Step 4: Generate Secure Secret for Environment Variables

```powershell
# Generate a secure random secret for NEXTAUTH_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Copy the output** - you'll need it for Vercel!

---

## Step 5: Deploy to Vercel (Manual Steps in Browser)

**You need to do this in a browser:**

1. Go to: https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your `cedula` repository
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add `NEXTAUTH_SECRET` = (paste the secret from Step 4)
   - Add `NEXTAUTH_URL` = `https://your-project-name.vercel.app` (use the URL Vercel shows)
   - Click "Save" for each
6. Click "Deploy"
7. Wait 2-3 minutes
8. **Get your URL** from the deployment page!

---

## Step 6: Update NEXTAUTH_URL (After Getting Your URL)

Once you have your Vercel URL (e.g., `https://cedula-xxxxx.vercel.app`):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel URL
3. Go to Deployments tab
4. Click "..." on latest deployment → "Redeploy"

---

## Quick Copy-Paste Script (All Commands Together)

```powershell
# ============================================
# COMPLETE DEPLOYMENT SCRIPT
# ============================================
# Replace YOUR_USERNAME and your.email@example.com before running!

# Step 1: Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Step 2: Navigate to project
cd C:\Users\marti\Desktop\cedula

# Step 3: Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
git branch -M main

# Step 4: Generate secret
Write-Host "`n=== GENERATED SECRET (copy this) ===" -ForegroundColor Green
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "====================================`n" -ForegroundColor Green

# Step 5: Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "If prompted, use Personal Access Token as password" -ForegroundColor Yellow
git push -u origin main

Write-Host "`n✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://vercel.com/signup" -ForegroundColor White
Write-Host "2. Sign up with GitHub" -ForegroundColor White
Write-Host "3. Import your repository" -ForegroundColor White
Write-Host "4. Add environment variables (use the secret above)" -ForegroundColor White
Write-Host "5. Deploy!" -ForegroundColor White
```

---

## Troubleshooting Commands

### If "remote origin already exists":
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
```

### If push fails with authentication:
```powershell
# Check current remote
git remote -v

# Generate new Personal Access Token at:
# https://github.com/settings/tokens
# Then use it as password when pushing
```

### If you need to check git status:
```powershell
git status
git log --oneline
```

### If you need to verify build works:
```powershell
npm run build
```

---

## After Deployment - Test Your URL

Once you have your Vercel URL, test it:

```powershell
# Open in browser (replace with your actual URL)
Start-Process "https://your-project-name.vercel.app"
```

---

## Summary: What You Need

1. ✅ **GitHub account** (create at github.com if needed)
2. ✅ **GitHub repository** (create at github.com/new)
3. ✅ **Vercel account** (sign up at vercel.com)
4. ✅ **Personal Access Token** (from github.com/settings/tokens)

---

## Expected Timeline

- **Git setup**: 1 minute
- **Push to GitHub**: 2-3 minutes
- **Vercel deployment**: 5 minutes
- **Total**: ~10 minutes to get your URL!

---

## Your URL Will Be

After deployment, you'll get:
- **Vercel URL**: `https://cedula-xxxxx.vercel.app` (or similar)
- **HTTPS**: Automatic ✅
- **SSL**: Free ✅
- **Ready to share**: Yes! 🎉
