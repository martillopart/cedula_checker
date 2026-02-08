# WSL Virtualization Setup Required

## Issue
WSL2 requires **Virtualization** to be enabled in your BIOS. This is a hardware setting that needs to be changed manually.

## Solution Options

### Option 1: Enable Virtualization in BIOS (For WSL2)

**Steps:**
1. **Restart your computer**
2. **Enter BIOS/UEFI:**
   - During startup, press the BIOS key (usually: `F2`, `F10`, `F12`, `Del`, or `Esc`)
   - Check your computer's manual for the exact key
3. **Find Virtualization settings:**
   - Look for "Virtualization Technology" or "VT-x" or "AMD-V"
   - Common locations:
     - Advanced → CPU Configuration
     - Advanced → System Agent Configuration
     - Security → Virtualization
4. **Enable it:**
   - Set to "Enabled"
   - Save and exit BIOS
5. **After restart, install Ubuntu:**
   ```powershell
   wsl --install -d Ubuntu
   ```

### Option 2: Use WSL1 (No BIOS Changes Needed)

WSL1 doesn't require virtualization but is slower and has some limitations.

**Install WSL1:**
```powershell
# Set default to WSL1
wsl --set-default-version 1

# Install Ubuntu with WSL1
wsl --install -d Ubuntu
```

### Option 3: Continue with PowerShell (Recommended)

**You don't actually need WSL!** PowerShell works perfectly for:
- ✅ Git operations
- ✅ npm/node commands  
- ✅ Deployment
- ✅ All project tasks

**For deployment, PowerShell is sufficient and easier.**

## Check Current Status

**Check if virtualization is enabled:**
```powershell
systeminfo | Select-String "Hyper-V"
```

**Check WSL version:**
```powershell
wsl --status
```

**List available distributions:**
```powershell
wsl --list --online
```

## Recommendation

**For this Next.js deployment project:**
- **Use PowerShell** - it's working perfectly
- **No WSL needed** - all commands work in PowerShell
- **Faster setup** - no BIOS changes required

**Only install WSL if:**
- You specifically need Linux commands
- You're more comfortable with bash
- You need to test Linux compatibility

## Quick Commands

**Enable WSL feature (if not enabled):**
```powershell
# Run PowerShell as Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

**Then restart and try installing Ubuntu again:**
```powershell
wsl --install -d Ubuntu
```

## Next Steps

1. **If you want WSL2:** Enable virtualization in BIOS, restart, then install Ubuntu
2. **If you want WSL1:** Run `wsl --set-default-version 1` then install Ubuntu
3. **If you don't need WSL:** Continue with PowerShell (recommended!)
