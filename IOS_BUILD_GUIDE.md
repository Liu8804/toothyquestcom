# iOS Native Build Guide for ToothyQuest

This guide walks you through building and submitting ToothyQuest to the Apple App Store.

## Prerequisites

- **macOS** with Xcode 15+ installed
- Apple Developer Account ($99/year)
- Node.js 18+ and npm

## Step 1: Export and Clone Project

1. In Lovable, click **Settings** → **GitHub** → **Export to GitHub**
2. Clone your repository locally:
   ```bash
   git clone <YOUR_GIT_URL>
   cd toothyquest
   ```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Add iOS Platform

```bash
npx cap add ios
```

## Step 4: Build the Web App

```bash
npm run build
```

## Step 5: Sync to Native Platform

```bash
npx cap sync ios
```

> **Note:** Run `npx cap sync` every time you pull new changes!

## Step 6: Open in Xcode

```bash
npx cap open ios
```

## Step 7: Configure Xcode Project

### Signing & Capabilities
1. Select the **App** target in Xcode
2. Go to **Signing & Capabilities** tab
3. Select your **Team** (Apple Developer account)
4. Bundle ID: `com.toothyquest.app`

### App Icons
1. Open **Assets.xcassets** → **AppIcon**
2. Add icons from `/public/ios-icons/` folder
3. Required sizes: 1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20

### Launch Screen
1. Open **LaunchScreen.storyboard**
2. Set background color to `#FEF3E2`
3. Add splash image from `/public/splash-ios-portrait.png`

### Info.plist Settings
Add these entries for kids app compliance:
```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
<key>UIRequiresFullScreen</key>
<true/>
```

## Step 8: Test on Device

1. Connect your iPhone/iPad
2. Select your device in Xcode toolbar
3. Click **Run** (⌘R)

## Step 9: Archive for App Store

1. Select **Any iOS Device** as build target
2. **Product** → **Archive**
3. Wait for archive to complete

## Step 10: Upload to App Store Connect

1. Open **Window** → **Organizer**
2. Select your archive
3. Click **Distribute App**
4. Choose **App Store Connect**
5. Follow prompts to upload

## Step 11: App Store Connect Setup

### App Information
- **Name:** ToothyQuest - Make Brushing Fun!
- **Subtitle:** Dental Adventures for Kids 3-9
- **Primary Category:** Education
- **Secondary Category:** Kids
- **Age Rating:** 4+ (Made for Kids)

### Privacy Policy
- URL: `https://toothyquestcom.lovable.app/privacy`

### App Privacy
- Data Not Collected (verify at `/app-privacy`)

### Screenshots
Upload from `/public/screenshots/`:
- iphone-home.png
- iphone-games.png
- iphone-stories.png
- iphone-timer.png
- iphone-rewards.png

### App Preview Video
Upload `/public/app-preview-video.mp4` if generated

## Troubleshooting

### White Screen on Launch
- Run `npx cap sync` after any web changes
- Check Xcode console for errors

### Audio Not Playing
- Ensure device is not on silent mode
- Check AudioContext unlocking in useAudioManager

### Push Notifications (Optional)
1. Enable Push Notifications capability in Xcode
2. Generate APNs key in Apple Developer portal
3. Configure in Lovable Cloud settings

## Production Build

Before final submission, update `capacitor.config.ts`:

```typescript
// Comment out for production:
// server: {
//   url: '...',
//   cleartext: true
// }
```

Then rebuild:
```bash
npm run build
npx cap sync ios
```

## Checklist

- [ ] App icons added to Assets.xcassets
- [ ] Launch screen configured
- [ ] Signing & capabilities set
- [ ] Tested on real device
- [ ] Production config (server removed)
- [ ] Archive created
- [ ] Uploaded to App Store Connect
- [ ] Screenshots uploaded
- [ ] App description completed
- [ ] Privacy policy URL added
- [ ] Age rating set to 4+
- [ ] Submitted for review

---

For more details, visit `/app-store-checklist` in your app.
