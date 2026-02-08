# Deployment Script for Cedula Habitabilidad Checker
# This script prepares and helps deploy your application

Write-Host "🚀 Cedula Deployment Script" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "❌ Git not initialized. Run: git init" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path node_modules)) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the project to verify it works
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please fix errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create a GitHub repository:" -ForegroundColor White
Write-Host "   - Go to https://github.com/new" -ForegroundColor Gray
Write-Host "   - Create a new repository named 'cedula'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Push to GitHub:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/cedula.git" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Deploy to Vercel:" -ForegroundColor White
Write-Host "   - Go to https://vercel.com/signup" -ForegroundColor Gray
Write-Host "   - Sign up with GitHub" -ForegroundColor Gray
Write-Host "   - Click 'Add New Project'" -ForegroundColor Gray
Write-Host "   - Import your repository" -ForegroundColor Gray
Write-Host "   - Add environment variables:" -ForegroundColor Gray
Write-Host "     NEXTAUTH_SECRET=<generate-secure-random-string>" -ForegroundColor Gray
Write-Host "     NEXTAUTH_URL=https://your-project.vercel.app" -ForegroundColor Gray
Write-Host "   - Click 'Deploy'" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Your app will be live in 2-3 minutes!" -ForegroundColor Green
