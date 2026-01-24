# Apple Developer Credentials Setup Guide

This guide walks you through generating all required Apple credentials for Codemagic CI/CD.

## Prerequisites

- Apple Developer Program membership ($99/year)
- Access to [Apple Developer Portal](https://developer.apple.com)
- Access to [App Store Connect](https://appstoreconnect.apple.com)

---

## Step 1: Create App Store Connect API Key

This allows Codemagic to upload builds and manage your app.

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **Users and Access** → **Integrations** tab
3. Click **App Store Connect API** in the sidebar
4. Click the **+** button to create a new key
5. Enter a name: `Codemagic CI/CD`
6. Select **Admin** access (required for uploads)
7. Click **Generate**
8. **IMPORTANT:** Download the `.p8` file immediately (you can only download it once!)
9. Note down:
   - **Issuer ID** (shown at top of page)
   - **Key ID** (shown in the key list)

### Save These Values:
```
Issuer ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Key ID: XXXXXXXXXX
API Key File: AuthKey_XXXXXXXXXX.p8
```

---

## Step 2: Create iOS Distribution Certificate

This certificate signs your app for the App Store.

### Option A: Using Keychain Access (Mac Required)

1. Open **Keychain Access** on your Mac
2. Go to **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**
3. Enter your email and select **Saved to disk**
4. Save the `.certSigningRequest` file

5. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/certificates/list)
6. Click **+** to create a new certificate
7. Select **Apple Distribution** (for App Store)
8. Upload your `.certSigningRequest` file
9. Download the certificate (`.cer` file)
10. Double-click to install in Keychain

11. In Keychain Access, find your certificate
12. Right-click → **Export** → Save as `.p12`
13. Set a password and remember it!

### Option B: Using Codemagic (No Mac Required!) ✨

Codemagic can generate certificates for you:

1. In Codemagic, go to your app settings
2. Navigate to **Code signing** → **iOS code signing**
3. Click **Generate certificate**
4. Codemagic will create and manage the certificate automatically!

---

## Step 3: Create App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list)
2. Click **+** to register a new identifier
3. Select **App IDs** → **App**
4. Enter:
   - **Description:** ToothyQuest
   - **Bundle ID:** `com.toothyquest.app` (Explicit)
5. Enable capabilities as needed:
   - ✅ Push Notifications (if using)
   - ✅ Associated Domains (if using deep links)
6. Click **Continue** → **Register**

---

## Step 4: Create Provisioning Profile

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/profiles/list)
2. Click **+** to create a new profile
3. Select **App Store Connect** (under Distribution)
4. Select your App ID: `com.toothyquest.app`
5. Select your Distribution Certificate
6. Enter profile name: `ToothyQuest App Store`
7. Click **Generate** and download

---

## Step 5: Configure Codemagic

### Add API Key Integration

1. Go to [Codemagic](https://codemagic.io)
2. Navigate to **Teams** → **Integrations**
3. Click **App Store Connect**
4. Upload your `.p8` API key file
5. Enter your **Issuer ID** and **Key ID**
6. Click **Save**

### Add Code Signing Credentials

1. Go to your app in Codemagic
2. Click **Settings** → **Code signing** → **iOS code signing**
3. Upload your:
   - **Distribution Certificate** (`.p12` file)
   - **Certificate Password**
   - **Provisioning Profile** (`.mobileprovision` file)

Or use **Automatic code signing** if you added the API key integration!

---

## Step 6: Verify Configuration

Your `codemagic.yaml` should have:

```yaml
environment:
  ios_signing:
    distribution_type: app_store
    bundle_identifier: com.toothyquest.app
```

When using API key integration, add:

```yaml
publishing:
  app_store_connect:
    auth: integration  # Uses the API key you configured
    submit_to_testflight: true
```

---

## Quick Checklist

- [ ] Apple Developer Program membership active
- [ ] App Store Connect API Key created (`.p8` file)
- [ ] Issuer ID and Key ID noted
- [ ] App ID registered (`com.toothyquest.app`)
- [ ] Distribution Certificate created (`.p12` file)
- [ ] Provisioning Profile created (`.mobileprovision` file)
- [ ] All credentials uploaded to Codemagic
- [ ] API Key integration configured in Codemagic

---

## Troubleshooting

### "No matching provisioning profile"
- Ensure your Bundle ID matches exactly: `com.toothyquest.app`
- Regenerate the provisioning profile after any certificate changes

### "Certificate not valid"
- Check certificate expiration (valid for 1 year)
- Ensure you're using a Distribution certificate, not Development

### "API key unauthorized"
- Verify the API key has Admin access
- Check Issuer ID and Key ID are correct

---

## Need Help?

- [Codemagic Documentation](https://docs.codemagic.io/yaml-code-signing/signing-ios/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
