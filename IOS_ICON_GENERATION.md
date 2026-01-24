# iOS App Icon Generation Guide

Generate all required icon sizes from your 1024x1024 source icon.

## Source Icon
Your source icon is located at: `public/ios-icons/icon-1024.png`

## Required Icon Sizes

| Size | Scale | Pixels | Usage |
|------|-------|--------|-------|
| 20pt | 1x | 20×20 | iPad Notifications |
| 20pt | 2x | 40×40 | iPhone/iPad Notifications |
| 20pt | 3x | 60×60 | iPhone Notifications |
| 29pt | 1x | 29×29 | iPad Settings |
| 29pt | 2x | 58×58 | iPhone/iPad Settings |
| 29pt | 3x | 87×87 | iPhone Settings |
| 40pt | 1x | 40×40 | iPad Spotlight |
| 40pt | 2x | 80×80 | iPhone/iPad Spotlight |
| 40pt | 3x | 120×120 | iPhone Spotlight |
| 60pt | 2x | 120×120 | iPhone App |
| 60pt | 3x | 180×180 | iPhone App |
| 76pt | 1x | 76×76 | iPad App |
| 76pt | 2x | 152×152 | iPad App |
| 83.5pt | 2x | 167×167 | iPad Pro App |
| 1024pt | 1x | 1024×1024 | App Store |

## Option 1: Online Icon Generator (Easiest) ⭐

Use a free online tool:

1. Go to [AppIcon.co](https://www.appicon.co/) or [MakeAppIcon](https://makeappicon.com/)
2. Upload your `public/ios-icons/icon-1024.png`
3. Select **iOS** platform
4. Download the generated icon set
5. Extract and copy all icons to `public/ios-icons/`

## Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Navigate to your project
cd public/ios-icons

# Generate all sizes
convert icon-1024.png -resize 20x20 icon-20.png
convert icon-1024.png -resize 40x40 icon-40.png
convert icon-1024.png -resize 60x60 icon-60.png
convert icon-1024.png -resize 29x29 icon-29.png
convert icon-1024.png -resize 58x58 icon-58.png
convert icon-1024.png -resize 87x87 icon-87.png
convert icon-1024.png -resize 80x80 icon-80.png
convert icon-1024.png -resize 120x120 icon-120.png
convert icon-1024.png -resize 180x180 icon-180.png
convert icon-1024.png -resize 76x76 icon-76.png
convert icon-1024.png -resize 152x152 icon-152.png
convert icon-1024.png -resize 167x167 icon-167.png
```

## Option 3: Using Node.js Script

Create a script that generates all icons:

```bash
# Install sharp
npm install sharp --save-dev

# Run generation script
node scripts/generate-icons.js
```

## Option 4: Xcode Automatic Generation

When you open the iOS project in Xcode:

1. Open `ios/App/App/Assets.xcassets`
2. Select **AppIcon**
3. Drag your 1024x1024 icon to the **App Store** slot (1024pt)
4. Xcode 15+ can auto-generate other sizes!

## Codemagic Automatic Setup

The `codemagic.yaml` includes a script to copy icons:

```yaml
- name: Copy app icons
  script: |
    # Copy icons to Xcode assets
    cp -r public/ios-icons/* ios/App/App/Assets.xcassets/AppIcon.appiconset/
```

## Contents.json for Xcode

After generating icons, create this file at `ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json`:

```json
{
  "images": [
    {"filename": "icon-20.png", "idiom": "iphone", "scale": "2x", "size": "20x20"},
    {"filename": "icon-60.png", "idiom": "iphone", "scale": "3x", "size": "20x20"},
    {"filename": "icon-58.png", "idiom": "iphone", "scale": "2x", "size": "29x29"},
    {"filename": "icon-87.png", "idiom": "iphone", "scale": "3x", "size": "29x29"},
    {"filename": "icon-80.png", "idiom": "iphone", "scale": "2x", "size": "40x40"},
    {"filename": "icon-120.png", "idiom": "iphone", "scale": "3x", "size": "40x40"},
    {"filename": "icon-120.png", "idiom": "iphone", "scale": "2x", "size": "60x60"},
    {"filename": "icon-180.png", "idiom": "iphone", "scale": "3x", "size": "60x60"},
    {"filename": "icon-20.png", "idiom": "ipad", "scale": "1x", "size": "20x20"},
    {"filename": "icon-40.png", "idiom": "ipad", "scale": "2x", "size": "20x20"},
    {"filename": "icon-29.png", "idiom": "ipad", "scale": "1x", "size": "29x29"},
    {"filename": "icon-58.png", "idiom": "ipad", "scale": "2x", "size": "29x29"},
    {"filename": "icon-40.png", "idiom": "ipad", "scale": "1x", "size": "40x40"},
    {"filename": "icon-80.png", "idiom": "ipad", "scale": "2x", "size": "40x40"},
    {"filename": "icon-76.png", "idiom": "ipad", "scale": "1x", "size": "76x76"},
    {"filename": "icon-152.png", "idiom": "ipad", "scale": "2x", "size": "76x76"},
    {"filename": "icon-167.png", "idiom": "ipad", "scale": "2x", "size": "83.5x83.5"},
    {"filename": "icon-1024.png", "idiom": "ios-marketing", "scale": "1x", "size": "1024x1024"}
  ],
  "info": {"author": "xcode", "version": 1}
}
```

## Quick Steps Summary

1. ✅ Use [AppIcon.co](https://www.appicon.co/) to generate all sizes
2. ✅ Download and extract the icon set
3. ✅ Place all icons in `public/ios-icons/`
4. ✅ Codemagic will copy them during build

## Your Current Assets

- ✅ `public/ios-icons/icon-1024.png` - App Store icon (ready!)
- ⏳ Other sizes needed - use generator above
