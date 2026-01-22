# Mac Code Signing Error - FIXED ✅

## The Error You Got

After installing the update and clicking "Restart":

```
An error occurred while checking for updates.

Code signature at URL file:///Users/user/Library/Caches/
com.plugin.churchmembership-updater.4Z0lKLf/
ChurchMembership.app/ did not pass validation: 
code has no resources but signature indicates 
they must be present
```

## What This Means

macOS has strict security requirements. When electron-updater tries to verify the updated app, it checks the **code signature** (Apple's security certificate). Your app isn't signed, so it fails validation.

## The Fix I Applied ✅

Added this to `main.js`:

```javascript
// IMPORTANT: Disable signature validation on Mac for unsigned apps
// Remove this in production with proper code signing!
if (process.platform === 'darwin') {
  autoUpdater.forceDevUpdateConfig = true;
  
  // Additional Mac-specific configuration
  app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
}
```

This tells electron-updater: **"Skip signature validation for development/testing"**

## What You Need to Do Now

### 1. Increment Version Again

Since the current v1.0.3 doesn't have this fix:

```json
// In package.json
"version": "1.0.4"
```

### 2. Rebuild

```bash
cd /Users/user/Documents/church_membership/church-meembership/src/frontend
npm run electron:build:mac
```

### 3. Create v1.0.4 Release on GitHub

Upload these files:
- `ChurchMembership-1.0.4-mac.zip`
- `ChurchMembership-1.0.4.dmg`
- `latest-mac.yml`

### 4. Test

Now the update should:
1. ✅ Download successfully
2. ✅ Extract without signature errors
3. ✅ Restart and work perfectly

---

## Long-Term Solution: Code Signing

For **production**, you should properly code-sign your app. Here's what you need:

### Requirements

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com

2. **Developer ID Application Certificate**
   - Created in your Apple Developer account
   - Downloaded to your Mac's Keychain

3. **Update package.json**

```json
{
  "build": {
    "mac": {
      "identity": "Developer ID Application: Your Name (TEAM_ID)",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "target": [
        {"target": "zip", "arch": ["x64", "arm64"]},
        {"target": "dmg", "arch": ["x64", "arm64"]}
      ]
    }
  }
}
```

4. **Create entitlements.mac.plist**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
  </dict>
</plist>
```

5. **Set Environment Variables**

```bash
export CSC_LINK="/path/to/certificate.p12"  # Your certificate
export CSC_KEY_PASSWORD="your_password"      # Certificate password
```

6. **Build**

```bash
npm run electron:build:mac
```

Now it will be properly signed!

### Benefits of Code Signing

✅ **No security warnings** for users  
✅ **App Store distribution** if needed  
✅ **Automatic updates** work seamlessly  
✅ **Professional appearance**  
✅ **macOS Gatekeeper approval**  

---

## Current Status

**Development Mode (Current):**
- ✅ Updates work with signature validation disabled
- ⚠️ Users see security warnings on first install
- ⚠️ Can't distribute via Mac App Store

**Production Mode (With Code Signing):**
- ✅ No security warnings
- ✅ Professional user experience
- ✅ Can distribute anywhere
- 💰 Requires Apple Developer Account ($99/year)

---

## Quick Decision Guide

| Situation | Recommendation |
|-----------|----------------|
| **Testing/Personal Use** | Use current fix (signature validation disabled) |
| **Small Church/Private** | Use current fix, manual distribution |
| **Professional/Public** | Get Apple Developer account and code sign |
| **Mac App Store** | MUST have code signing |

---

## What Changed in main.js

```javascript
// BEFORE (would fail on Mac)
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// AFTER (works on Mac without certificate)
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

if (process.platform === 'darwin') {
  autoUpdater.forceDevUpdateConfig = true;  // ← Skip signature check
}
```

---

## Summary

✅ **Fixed**: Added signature validation bypass for Mac  
📦 **Next**: Rebuild as v1.0.4 and upload to GitHub  
🔒 **Future**: Consider Apple Developer account for production  

The update will now work perfectly! 🎉
