# Quick Setup — Run on Your Phone in 15 Minutes

## Step 1 — Install tools (first time only)

```bash
# Install Node.js 18+ from https://nodejs.org
# Install Git from https://git-scm.com

# macOS only — install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install watchman
```

## Step 2 — Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/NovaBuilders.git
cd NovaBuilders
npm install
```

## Step 3 — Add your API key

```bash
cp .env.example .env
```

Open `.env` in any text editor and replace the placeholder:

```
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-REAL-KEY-HERE
```

Get your key at: https://console.anthropic.com → API Keys → Create Key

## Step 4 — Run on Android

### Option A: Physical Android phone

1. On your phone: Settings → About Phone → tap "Build number" 7 times
2. Settings → Developer Options → enable **USB Debugging**
3. Connect phone to computer with USB cable
4. Accept the "Allow USB debugging?" prompt on your phone

```bash
# Verify phone is detected
adb devices        # should show your device serial number

# Start the app
npm start          # keep this running
# In a new terminal:
npm run android
```

### Option B: Android Emulator

1. Open Android Studio → Device Manager → Create Device
2. Pick "Pixel 7" → API 34 → Finish
3. Click the play button to start the emulator

```bash
npm start
# In a new terminal:
npm run android
```

## Step 5 — Run on iPhone (macOS only)

```bash
# Install iOS dependencies
cd ios && pod install && cd ..

# Run on simulator
npm run ios

# Run on physical iPhone:
# Open ios/NovaBuilders.xcworkspace in Xcode
# Select your iPhone as the target device
# Press the Play button (⌘R)
# First time: trust the developer certificate on your iPhone
#   Settings → General → VPN & Device Management → Trust
```

---

## Common issues

| Problem | Fix |
|---|---|
| `SDK location not found` | Run `echo "sdk.dir=$ANDROID_HOME" > android/local.properties` |
| Metro fails to start | Run `npm start -- --reset-cache` |
| Pod install fails | Run `cd ios && pod repo update && pod install` |
| App crashes on launch | Check that `.env` has a valid `ANTHROPIC_API_KEY` |
| USB device not detected | Try a different USB cable (some cables are charge-only) |

---

## Update the API key later

Edit `.env` and change `ANTHROPIC_API_KEY`, then restart Metro:

```bash
npm start -- --reset-cache
```

---

## What each screen does

| Screen | How to reach it |
|---|---|
| **Home** | First tab — monthly totals, quick actions, recent bids |
| **New Bid** | Second tab — 5-step flow: client info → upload plans → scope → estimate → send |
| **My Bids** | Third tab — full history, search, filter by status |
| **Settings** | Fourth tab — company info, default overhead/profit %, notifications |
| **Bid Detail** | Tap any bid — full breakdown, send options, mark as accepted |
