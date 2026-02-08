# Setup and Run Guide

## Prerequisites

1. **Install Node.js 18+** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose the LTS version (recommended)
   - After installation, restart your terminal/PowerShell

2. **Verify Node.js installation**
   ```bash
   node --version
   npm --version
   ```
   Both commands should return version numbers.

## Step-by-Step Setup

### 1. Install Dependencies

Open PowerShell or Command Prompt in the project directory and run:

```bash
npm install
```

This will install all required packages. Wait for it to complete (may take 1-2 minutes).

### 2. Set Up Environment Variables (Optional but Recommended)

Create a file named `.env.local` in the root directory with the following content:

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

### 3. Run the Development Server

```bash
npm run dev
```

You should see output like:
```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 4. Open the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Verification Checklist

### ✅ Basic Functionality

1. **Home Page**
   - Visit `http://localhost:3000`
   - You should see the property input form
   - Fill out the form and submit
   - You should see evaluation results

2. **Authentication**
   - Visit `http://localhost:3000/auth/signup`
   - Create a test account (email, password min 8 chars, name)
   - Visit `http://localhost:3000/auth/signin`
   - Sign in with your credentials
   - You should be redirected to the dashboard

3. **Dashboard**
   - After signing in, visit `http://localhost:3000/dashboard`
   - You should see your cases (if any)
   - You can create new cases from the home page

4. **Case Management**
   - Create a case from the home page
   - Visit `/cases/[id]` to see case details
   - Try updating the case status

5. **Templates**
   - Visit `http://localhost:3000/templates`
   - Create a template
   - Templates should appear in the list

6. **Evidence Upload**
   - Go to a case detail page
   - Try uploading a photo or document
   - Evidence should appear in the case

### ✅ API Endpoints

Test these endpoints (use Postman, curl, or browser):

1. **Health Check**
   ```bash
   # Should return cases (empty array if no cases)
   curl http://localhost:3000/api/cases
   ```

2. **Create Case**
   ```bash
   # Create a test case (requires authentication)
   curl -X POST http://localhost:3000/api/cases \
     -H "Content-Type: application/json" \
     -d '{"propertyInput": {...}}'
   ```

### ✅ Build Verification

To ensure everything compiles correctly:

```bash
npm run build
```

This should complete without errors. If successful, you'll see:
```
✓ Compiled successfully
```

Then test the production build:

```bash
npm start
```

Visit `http://localhost:3000` - it should work the same as dev mode.

## Troubleshooting

### Issue: "npm is not recognized"
**Solution:** 
- Install Node.js from https://nodejs.org/
- Restart your terminal/PowerShell after installation
- Verify with `node --version` and `npm --version`

### Issue: Port 3000 already in use
**Solution:**
```bash
# Use a different port
npm run dev -- -p 3001
```
Then visit `http://localhost:3001`

### Issue: "Module not found" errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Authentication not working
**Solution:**
- Make sure `.env.local` exists with `NEXTAUTH_SECRET` set
- Restart the dev server after creating/modifying `.env.local`
- Clear browser cookies and try again

### Issue: Data not persisting
**Solution:**
- Check that the `data/` directory exists
- The app creates it automatically on first run
- Make sure you have write permissions in the project directory

## Quick Test Script

Run these commands to verify everything:

```bash
# 1. Check Node.js
node --version
npm --version

# 2. Install dependencies
npm install

# 3. Build (verifies TypeScript compilation)
npm run build

# 4. Start dev server
npm run dev
```

## Production Deployment

For production:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Environment variables:**
   - Set `NEXTAUTH_SECRET` to a strong random string
   - Set `NEXTAUTH_URL` to your production domain
   - Set Google OAuth credentials if using Google login

## Next Steps

Once everything is running:

1. ✅ Test user registration and login
2. ✅ Create a test case
3. ✅ Upload evidence files
4. ✅ Create and use templates
5. ✅ Test the case pipeline (status updates)
6. ✅ Generate PDF reports
7. ✅ Test share links

Everything should work perfectly! 🚀
