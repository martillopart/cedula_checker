# Cédula de Habitabilidad Checker

A web-based tool for checking property requirements for the cédula de habitabilidad (habitability certificate) in Spain, starting with Catalonia. Built with Next.js 14, TypeScript, and a focus on security, validation, and user experience.

## Features

### Phase 1 (MVP) - ✅ Complete
- ✅ **Guided Property Intake Form** - Fast, user-friendly form to input property details
- ✅ **Rules Engine** - Evaluates against Catalonia requirements (Decret 141/2012)
- ✅ **Smart Evaluation** - Pass/Risk/Fail/Unknown results with confidence scores
- ✅ **Client-Ready PDF Reports** - Professional PDF reports ready to share with clients
- ✅ **Share Links** - Generate shareable links for reports
- ✅ **Pricing Page** - Clear pricing structure for different user tiers

### Phase 2 - ✅ Complete
- ✅ **User Authentication** - Secure email/password authentication with NextAuth.js
- ✅ **Gmail Login** - OAuth authentication with Google/Gmail
- ✅ **Team Accounts & Permissions** - Team management with role-based access control
- ✅ **Case Pipeline** - Complete workflow: New → Waiting → Scheduled → Ready → Submitted → Done
- ✅ **Templates** - Reusable case templates for faster property input
- ✅ **Evidence Capture** - Upload photos and documents associated with cases
- ✅ **Dashboard** - User dashboard to manage all cases
- ✅ **Comprehensive Validation** - All inputs validated and sanitized for security
- ✅ **Rate Limiting** - API protection against abuse
- ✅ **Access Control** - Secure case and resource ownership

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git (for deployment)

### Installation

1. **Install Dependencies:**
```bash
npm install
```

2. **Set Up Environment Variables (Optional but Recommended):**
Create a file named `.env.local` in the root directory:

```env
# Required for NextAuth.js (use a random string in production)
NEXTAUTH_SECRET=your-secret-key-change-in-production-12345
NEXTAUTH_URL=http://localhost:3000

# Optional: For Google OAuth login
# Get these from: https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Note:** 
- For development, you can use any string for `NEXTAUTH_SECRET` (e.g., `dev-secret-key-12345`)
- Google OAuth is optional - the app works without it (email/password auth will still work)
- The app will create data files automatically in the `data/` directory

3. **Run the Development Server:**
```bash
npm run dev
```

4. **Open the Application:**
Open your browser and navigate to: `http://localhost:3000`

### Building for Production
```bash
npm run build
npm start
```

## Deployment - Get Your URL Up and Running

Follow these steps to deploy your application to Vercel and get a live URL.

### Step 1: Configure Git Identity

Run these PowerShell commands to set up your Git identity:

```powershell
# Set your name (replace "Your Name" with your actual name or GitHub username)
git config --global user.name "Your Name"

# Set your email (replace with your GitHub email)
git config --global user.email "your.email@example.com"

# Verify it's set correctly
git config user.name
git config user.email
```

### Step 2: Create GitHub Repository (Manual Step)

**You need to do this in a browser first:**

1. Go to: https://github.com/new
2. Repository name: `cedula`
3. Choose Public or Private
4. **DO NOT** check README, .gitignore, or license
5. Click "Create repository"
6. **Copy your repository URL** (e.g., `https://github.com/YOUR_USERNAME/cedula.git`)

### Step 3: Connect to GitHub and Push

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

### Step 4: Generate Secure Secret for Environment Variables

```powershell
# Generate a secure random secret for NEXTAUTH_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Copy the output** - you'll need it for Vercel!

### Step 5: Deploy to Vercel (Manual Steps in Browser)

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

### Step 6: Update NEXTAUTH_URL (After Getting Your URL)

Once you have your Vercel URL (e.g., `https://cedula-xxxxx.vercel.app`):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel URL
3. Go to Deployments tab
4. Click "..." on latest deployment → "Redeploy"

### Quick Copy-Paste Script (All Commands Together)

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

### Troubleshooting Commands

**If "remote origin already exists":**
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/cedula.git
```

**If push fails with authentication:**
```powershell
# Check current remote
git remote -v

# Generate new Personal Access Token at:
# https://github.com/settings/tokens
# Then use it as password when pushing
```

**If you need to check git status:**
```powershell
git status
git log --oneline
```

**If you need to verify build works:**
```powershell
npm run build
```

### After Deployment - Test Your URL

Once you have your Vercel URL, test it:

```powershell
# Open in browser (replace with your actual URL)
Start-Process "https://your-project-name.vercel.app"
```

### Summary: What You Need

1. ✅ **GitHub account** (create at github.com if needed)
2. ✅ **GitHub repository** (create at github.com/new)
3. ✅ **Vercel account** (sign up at vercel.com)
4. ✅ **Personal Access Token** (from github.com/settings/tokens)

### Expected Timeline

- **Git setup**: 1 minute
- **Push to GitHub**: 2-3 minutes
- **Vercel deployment**: 5 minutes
- **Total**: ~10 minutes to get your URL!

### Your URL Will Be

After deployment, you'll get:
- **Vercel URL**: `https://cedula-xxxxx.vercel.app` (or similar)
- **HTTPS**: Automatic ✅
- **SSL**: Free ✅
- **Ready to share**: Yes! 🎉

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Modern styling
- **NextAuth.js** - Authentication and session management
- **bcryptjs** - Password hashing
- **jsPDF + jspdf-autotable** - PDF generation
- **File-based storage** - JSON file storage (easily upgradeable to database)

## Project Structure

```
├── app/
│   ├── api/                    # API routes (auth, cases, templates, evidence, pdf, share)
│   ├── auth/                   # Authentication pages (signin, signup)
│   ├── dashboard/              # User dashboard
│   ├── cases/                  # Case detail pages
│   ├── templates/              # Template management UI
│   ├── results/                # Results display
│   ├── share/                  # Public share pages
│   └── pricing/                # Pricing page
├── components/                 # Reusable React components
├── lib/                        # Utilities (auth, db, validation, rateLimit, rules, pdf)
├── types/                      # TypeScript type definitions
└── data/                       # JSON file storage (cases, users, teams, templates, evidence)
```

## API Documentation

### Authentication
- **POST /api/auth/signup** - Create a new user account
- **POST /api/auth/[...nextauth]** - NextAuth.js endpoint (Credentials & Google OAuth)

### Cases
- **GET /api/cases** - Get all cases for authenticated user
- **POST /api/cases** - Create a new case
- **GET /api/cases/[id]** - Get specific case
- **PATCH /api/cases/[id]** - Update case (status, assignment, dates, notes, tags)

### Templates
- **GET /api/templates?scope=user|team|public** - Get templates by scope
- **POST /api/templates** - Create a new template

### Evidence
- **GET /api/evidence?caseId=uuid** - Get evidence for a case
- **POST /api/evidence** - Upload evidence (FormData, max 10MB, JPEG/PNG/WebP/PDF/DOC/DOCX)

### PDF & Sharing
- **GET /api/pdf/[id]** - Download PDF report
- **GET /api/share/[shareId]** - Get case by share ID (public access)

## User Guide

### Authentication
1. **Sign Up**: Navigate to `/auth/signup` (email, password min 8 chars, name required)
2. **Sign In**: Navigate to `/auth/signin` (email/password or Gmail/Google OAuth)
3. **Session**: Managed automatically by NextAuth.js

### Case Management
- **Creating**: Fill property form on home page (`/`), submit to create and evaluate
- **Pipeline**: New → Waiting → Scheduled → Ready → Submitted → Done
- **Updating**: Navigate to `/cases/[id]` to update status, assign, set dates, add notes/tags
- **Viewing**: Dashboard (`/dashboard`) for all cases, case detail page for full information

### Templates
- **Creating**: Navigate to `/templates`, create template with property input
- **Using**: Select template to pre-fill new case form

### Evidence Management
- **Uploading**: Navigate to case detail page, upload files (max 10MB, JPEG/PNG/WebP/PDF/DOC/DOCX)
- **Viewing**: Evidence displayed on case detail page, filter by type

## Security Features

- **Input Validation & Sanitization**: All inputs sanitized, length limits enforced, type validation
- **Authentication Security**: bcryptjs password hashing, OAuth 2.0, NextAuth.js sessions, JWT
- **File Upload Security**: Filename sanitization, path traversal prevention, file type whitelist, size limits
- **Access Control**: Case ownership verification, team membership validation, proper HTTP status codes
- **Rate Limiting**: API endpoints protected, IP-based tracking
- **Error Handling**: Comprehensive try-catch, user-friendly messages, no sensitive info leaked

## Rules Engine

Evaluates properties against Catalonia's cédula de habitabilidad requirements (Decret 141/2012):
- Minimum useful area (30 m² for primera ocupación, 36 m² for segunda ocupación/renovation)
- Minimum ceiling height (2.5m for habitable spaces)
- Minimum room size (6 m² per room for separate rooms, 8 m² if single space)
- Required facilities (kitchen, bathroom)
- **Kitchen details**: Running water, drainage system, cooking appliance (stove/fireplace)
- **Bathroom details**: WC (toilet), shower or bathtub, running water, drainage
- **Water supply**: Running water and hot water connection
- **Drainage system**: Proper wastewater evacuation system
- **Electrical installation**: Compliant electrical system
- **Gas installation**: Safe and compliant gas installation (if applicable, with adequate ventilation)
- **Energy efficiency certificate**: Energy performance certificate (CTE - recommended, not blocking)
- **Access and circulation**: Safe access for multi-story buildings (stairs, door width ≥0.8m, corridor width ≥1.2m)
- Natural light and ventilation
- Occupancy density (9 m² per person minimum)
- Minimum number of rooms
- Heating system

Each rule returns: severity (pass/risk/fail/unknown), explanation, fix guidance, confidence (0-100%).

## Data Storage

File-based JSON storage in `/data/`:
- `cases.json`, `users.json`, `teams.json`, `team-members.json`, `templates.json`, `evidence.json`
- `evidence/` directory for uploaded files

Easily upgradeable to PostgreSQL, MongoDB, Supabase, or any other database.

## Pricing Structure

- **Free**: 1 report/month with watermark
- **Solo** (€49/mo): 60 reports/month, no watermark
- **Team** (€199/mo): 400 reports/month, team features

## Roadmap

### Phase 1 (MVP) - ✅ Complete
- Basic form and rules engine, PDF generation, share links, pricing page

### Phase 2 - ✅ Complete
- User authentication, team accounts, case pipeline, templates, evidence capture

### Phase 3 (Months 2-6)
- Multi-region support, municipality-specific overrides, integrations (Google Drive, Dropbox, CRM), rules admin panel, team UI components

### Phase 4 (Months 6-12)
- White-label reports, API for enterprise clients, analytics dashboard, partner channels, payment processing (Stripe)

## Development

```bash
npm run lint    # Linting
npm run build   # Build for production
```

## Contributing

This is an MVP. For production use, consider:
- Payment processing (Stripe)
- Real database upgrade
- Error tracking (Sentry)
- Comprehensive logging
- Unit and integration tests
- CI/CD pipeline

## License

MIT

## Disclaimer

This tool provides pre-validation only. It does not replace the official certification by a qualified technician. Always consult with a licensed professional for official cédula de habitabilidad certification.
