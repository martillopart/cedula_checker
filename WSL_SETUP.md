# WSL Setup Guide for Cursor

## Current Status
- ✅ WSL is installed (version 2)
- ❌ No Linux distribution installed yet

## Option 1: Install WSL Distribution (If You Need It)

### Install Ubuntu (Recommended)

1. **Open PowerShell as Administrator:**
   - Right-click Start menu
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Install Ubuntu:**
   ```powershell
   wsl --install -d Ubuntu
   ```

3. **Or install from Microsoft Store:**
   - Open Microsoft Store
   - Search for "Ubuntu"
   - Click "Install"

4. **After installation:**
   - Launch Ubuntu from Start menu
   - Set up username and password
   - Wait for initial setup to complete

### Use WSL in Cursor Terminal

1. **In Cursor:**
   - Press `Ctrl + Shift + P` (or `Cmd + Shift + P` on Mac)
   - Type: "Terminal: Select Default Profile"
   - Choose "WSL" or "Ubuntu"

2. **Or open new WSL terminal:**
   - Press `Ctrl + Shift + P`
   - Type: "Terminal: Create New Terminal"
   - Click the dropdown next to the `+` button
   - Select "WSL" or "Ubuntu"

## Option 2: Continue with PowerShell (Recommended for This Project)

**You don't need WSL!** PowerShell works perfectly fine for:
- ✅ Git operations
- ✅ npm/node commands
- ✅ Deployment
- ✅ Everything we've been doing

**To use PowerShell in Cursor:**
- Default terminal is already PowerShell
- Or select it manually:
  - `Ctrl + Shift + P` → "Terminal: Select Default Profile" → "PowerShell"

## Why You Might Want WSL

WSL is useful if you:
- Need Linux-specific tools
- Want to run Linux commands
- Are more comfortable with bash
- Need to test Linux compatibility

## Why PowerShell is Fine

For this Next.js project:
- ✅ All commands work in PowerShell
- ✅ Git works perfectly
- ✅ npm/node work perfectly
- ✅ Deployment works perfectly
- ✅ No need for WSL

## Quick Commands

**Check if WSL distro is installed:**
```powershell
wsl --list --verbose
```

**Install Ubuntu:**
```powershell
wsl --install -d Ubuntu
```

**Open WSL from PowerShell:**
```powershell
wsl
```

**Open specific distro:**
```powershell
wsl -d Ubuntu
```

## Recommendation

**For this deployment project, stick with PowerShell!** It's working perfectly and you don't need WSL. Only install WSL if you have a specific need for Linux commands.
