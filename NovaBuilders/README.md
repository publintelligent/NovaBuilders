# Nova Builders — Estimator Pro

<p align="center">
  <img src="assets/images/icon_store.png" width="120" alt="Nova Builders Logo" />
</p>

<p align="center">
  <strong>AI-powered construction bid estimator for Nova Builders</strong><br/>
  Upload architectural plans → Get instant estimates → Send professional PDF bids to clients
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.73-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Claude_AI-Sonnet_4-orange" />
  <img src="https://img.shields.io/badge/Platform-iOS_%7C_Android-lightgrey?logo=apple" />
  <img src="https://img.shields.io/badge/License-Private-red" />
</p>

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [How AI Estimation Works](#how-ai-estimation-works)
- [Building for Production](#building-for-production)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Features

- **AI Plan Analysis** — Upload PDF or image plans; Claude reads dimensions, materials, scope, and generates division-by-division cost estimates
- **5-Step Bid Flow** — Client info → Upload plans → Scope review → Estimate with live overhead/profit controls → Send
- **Professional PDF Bids** — Auto-generated client-facing proposals with Nova Builders branding, logo, payment schedule, exclusions, and signature blocks
- **Multiple Send Options** — Email via mail app, WhatsApp, or native share sheet
- **Bid Management** — Full history with search, filter by status, group by month
- **Configurable Pricing** — Default overhead % and profit % per company settings; adjustable per bid
- **Offline Storage** — All bids saved locally via AsyncStorage, no backend required
- **Nova Logo App Icon** — Gold house logo rendered at all required sizes for both platforms

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.73 + TypeScript |
| Navigation | React Navigation 6 (Bottom Tabs + Native Stack) |
| AI Engine | Anthropic Claude claude-sonnet-4-20250514 (vision + text) |
| Storage | AsyncStorage (local, no backend) |
| File Access | react-native-document-picker + react-native-fs |
| Sharing | react-native-share + Linking API |
| HTTP | Axios |
| State | React Context API |
| Build | Gradle (Android) + Xcode / CocoaPods (iOS) |
| CI | GitHub Actions |

---

## Prerequisites

Make sure you have the full React Native development environment set up before starting.

### All platforms

```bash
node --version    # must be >= 18
npm --version     # must be >= 9
```

### macOS (required for iOS)

```bash
# Install Xcode from the Mac App Store, then:
xcode-select --install
sudo xcodebuild -license accept

# Install CocoaPods
sudo gem install cocoapods

# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install watchman
brew install watchman
```

### Android (macOS, Linux, or Windows)

1. Install [Android Studio](https://developer.android.com/studio)
2. In Android Studio → SDK Manager, install:
   - Android SDK Platform 34
   - Android SDK Build-Tools 34
   - Android NDK 25.1.8937393
3. Add to your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
# export ANDROID_HOME=$HOME/Android/Sdk              # Linux
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

4. Reload your shell: `source ~/.zshrc`

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/NovaBuilders.git
cd NovaBuilders
```

### 2. Install Node dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXX
```

> Get your API key at [console.anthropic.com](https://console.anthropic.com)

### 4. iOS setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 5. Android setup

Make sure you have an Android emulator running or a physical device connected with USB debugging enabled.

```bash
# Verify device is detected
adb devices
```

---

## Running the App

### Start Metro bundler

```bash
npm start
```

Keep this terminal open. Open a second terminal for the platform commands below.

### iOS

```bash
npm run ios
# Or for a specific simulator:
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Android

```bash
npm run android
```

### Physical device (Android)

```bash
# Enable Developer Options and USB Debugging on your phone
# Connect via USB, then:
adb reverse tcp:8081 tcp:8081
npm run android
```

---

## Project Structure

```
NovaBuilders/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions: lint, test, build
├── android/                        # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/novabuilders/estimator/
│   │   │   │   ├── MainActivity.java
│   │   │   │   └── MainApplication.java
│   │   │   ├── res/
│   │   │   │   ├── mipmap-*/       # App icons (all densities)
│   │   │   │   ├── values/         # strings.xml, styles.xml
│   │   │   │   └── xml/            # file_paths.xml
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── proguard-rules.pro
│   ├── build.gradle
│   ├── gradle.properties
│   └── settings.gradle
├── assets/
│   └── images/
│       ├── icon_store.png          # 512×512 — Google Play / App Store
│       ├── icon_1024.png           # 1024×1024 — iOS App Store
│       ├── icon_xxxhdpi.png        # 192×192
│       ├── icon_xxhdpi.png         # 144×144
│       ├── icon_xhdpi.png          # 96×96  ← used in app UI
│       ├── icon_hdpi.png           # 72×72
│       └── icon_mdpi.png           # 48×48
├── ios/
│   ├── NovaBuilders/
│   │   ├── Images.xcassets/
│   │   │   └── AppIcon.appiconset/ # All iOS icon sizes + Contents.json
│   │   └── Info.plist
│   └── Podfile
├── src/
│   ├── components/
│   │   ├── AppHeader.tsx           # Shared top navigation bar
│   │   ├── BidCard.tsx             # Reusable bid list item
│   │   ├── DivisionRow.tsx         # Scope/division toggle row
│   │   ├── EmptyState.tsx          # Empty list placeholder
│   │   ├── LoadingOverlay.tsx      # AI analysis modal
│   │   ├── SectionHeader.tsx       # Section title with optional action
│   │   ├── SendBidModal.tsx        # Email/WhatsApp/share sheet
│   │   └── StatCard.tsx            # Metric summary card
│   ├── context/
│   │   ├── BidsContext.tsx         # Global bids state + AsyncStorage
│   │   └── SettingsContext.tsx     # Company settings + AsyncStorage
│   ├── hooks/
│   │   ├── useBidSearch.ts         # Search + filter + sort bids
│   │   └── useMonthlyStats.ts      # Monthly totals, win rate, trends
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Bottom tabs + modal stack
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Dashboard — stats + recent bids
│   │   ├── NewBidScreen.tsx        # 5-step bid creation flow
│   │   ├── MyBidsScreen.tsx        # Full bid history with search
│   │   ├── SettingsScreen.tsx      # Company info + pricing defaults
│   │   └── BidDetailScreen.tsx     # Single bid view + actions
│   ├── services/
│   │   ├── claudeService.ts        # Anthropic API — plan analysis + email copy
│   │   └── pdfService.ts           # HTML bid generation + file save
│   └── utils/
│       ├── calculations.ts         # Cost math, formatting, bid numbers
│       ├── theme.ts                # Colors, fonts, spacing, shadows
│       └── types.ts                # TypeScript interfaces + constants
├── .env.example                    # Environment variables template
├── .eslintrc.js
├── .gitignore
├── .prettierrc
├── App.tsx                         # Root component
├── app.json
├── babel.config.js
├── index.js                        # RN entry point
├── metro.config.js
├── package.json
└── tsconfig.json
```

---

## How AI Estimation Works

### With plans uploaded

1. User picks a PDF or image from their device using the document picker
2. The file is read as base64 using `react-native-fs`
3. The base64 payload is sent to `POST /v1/messages` with Claude claude-sonnet-4-20250514 using the document or image vision block
4. Claude returns structured JSON with:
   - Square footage extracted from drawings
   - Division cost estimates (demo, foundation, framing, roofing, etc.)
   - Which divisions to include
   - Key observations about materials and site conditions
5. The app renders the estimate with live overhead % and profit % sliders

### Without plans (SF fallback)

If no plans are uploaded, costs are estimated from square footage using Utah 2026 market rates defined in `COST_PER_SF` in `src/utils/types.ts`. You can update these rates anytime.

### Email copy generation

When sending a bid, Claude generates a brief professional email body customized with the client name, project type, address, and total amount.

---

## Building for Production

### Android Release APK

```bash
# 1. Generate a signing keystore (one time only)
keytool -genkey -v \
  -keystore android/app/nova-release.keystore \
  -alias nova-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# 2. Add signing config to ~/.gradle/gradle.properties (NOT in the repo)
MYAPP_UPLOAD_STORE_FILE=nova-release.keystore
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_ALIAS=nova-key
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password

# 3. Build release APK
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk

# Or build AAB for Google Play
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### iOS Release (App Store)

```bash
# Open Xcode workspace
open ios/NovaBuilders.xcworkspace
```

In Xcode:
1. Select the `NovaBuilders` target → Signing & Capabilities
2. Set your Apple Developer Team
3. Change scheme to `Release`
4. Product → Archive
5. Distribute App → App Store Connect

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |

**GitHub Actions secrets** — add `ANTHROPIC_API_KEY` to your repo:
> GitHub repo → Settings → Secrets and variables → Actions → New repository secret

---

## Troubleshooting

### Metro bundler not starting

```bash
# Clear cache and restart
npm start -- --reset-cache
```

### Android build fails — SDK not found

```bash
# Create local.properties pointing to your SDK
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### iOS — CocoaPods error

```bash
cd ios
pod deintegrate
pod install --repo-update
```

### iOS — Simulator not found

```bash
# List available simulators
xcrun simctl list devices
# Run on specific simulator
npx react-native run-ios --simulator="iPhone 15"
```

### `ANTHROPIC_API_KEY` not loading

Make sure `react-native-config` or `babel-plugin-transform-inline-environment-variables` is installed, or access the key via `process.env.ANTHROPIC_API_KEY` after installing:

```bash
npm install react-native-config
```

Then follow the [react-native-config setup](https://github.com/luggit/react-native-config#setup) for iOS and Android.

### Android — Gradle daemon out of memory

```bash
# Add to android/gradle.properties
org.gradle.jvmargs=-Xmx4096m
```

### Permission denied on Android (file picker)

Make sure `READ_MEDIA_IMAGES` and `READ_EXTERNAL_STORAGE` permissions are granted. On Android 13+ use `READ_MEDIA_IMAGES` only.

---

## Pricing Model

The default pricing follows the Nova Builders standard:

```
Direct Cost (materials + labor per division)
+ Overhead %  → configurable, default 12%
─────────────────────────────────────────
Cost Base
× Profit %   → configurable, default 15%
─────────────────────────────────────────
Grand Total  → rounded to nearest $1,000
```

Base cost-per-SF rates for Utah 2026 are defined in `src/utils/types.ts → COST_PER_SF` and can be updated at any time.

---

## License

Private — Nova Builders © 2026. All rights reserved.
This codebase is proprietary and confidential. Not for distribution.

---

## Contact

**Isai Tapia** — Project Manager  
📞 801-918-1236  
✉ novabuilders@yahoo.com  
🏗 Nova Builders · Lic. 14271957-5501 · Utah Area
