# iPhone Setup Guide

> **Status: untested on a real device.** The proxy code passes all automated tests and the PWA injection follows Apple's documented specifications, but this has not yet been verified on an actual iPhone. If something does not work, open an issue or update this guide.

This guide walks through the full setup from scratch: installing T3 Code, installing Tailscale, running the PWA proxy, and adding T3 Code to the iPhone home screen as a fullscreen app.

The result should be a native-feeling T3 Code experience on iPhone with no App Store, no Apple Developer Account, and no browser chrome.

## What You Need

- A Mac (or Windows/Linux machine) that will run T3 Code
- An iPhone (iOS 16.4 or later recommended, works from iOS 14+)
- A free Tailscale account

## Overview

```
iPhone Safari (PWA)
    |
    | HTTPS (via Tailscale Serve)
    v
PWA Proxy (this repo, HTTP mode, port 3780)
    |
    | HTTP (localhost)
    v
T3 Code Alpha (port 3773)
```

The PWA proxy wraps T3 Code with the metadata Safari needs to treat it as a home screen app: fullscreen display, a home screen icon, safe area padding for the notch, and static asset caching (icons, manifest).

Tailscale Serve provides the HTTPS layer with real certificates so Safari trusts the connection without warnings.

## Step 1: Install T3 Code Alpha

On your Mac (or desktop machine):

1. Download T3 Code from the official source.
2. Install and open it.
3. Confirm it is running at `http://localhost:3773` (the default port).

You can verify by opening `http://localhost:3773` in a browser on the same machine. You should see the T3 Code interface.

## Step 2: Install Tailscale

### On your Mac

1. Download Tailscale from [tailscale.com/download](https://tailscale.com/download).
2. Install the app and sign in (Google, GitHub, Apple, or email).
3. Keep Tailscale running in the menu bar.

### On your iPhone

1. Install Tailscale from the App Store.
2. Sign in with the **same account** you used on your Mac.
3. Accept the VPN configuration prompt.
4. Open the Tailscale app and confirm your Mac appears in the device list.

Both devices should now be visible in your Tailnet. You can verify at [login.tailscale.com/admin/machines](https://login.tailscale.com/admin/machines).

## Step 3: Enable Tailscale HTTPS

Tailscale can automatically issue real HTTPS certificates for your devices. This is required so Safari trusts the connection.

1. Open [login.tailscale.com/admin/dns](https://login.tailscale.com/admin/dns).
2. Make sure **MagicDNS** is enabled.
3. Make sure **HTTPS Certificates** is enabled.

Note your machine's Tailscale hostname, for example `my-mac.tailnet-name.ts.net`. You will use this later.

## Step 4: Set Up The PWA Proxy

On your Mac (the same machine running T3 Code):

### Install Node.js (if not already installed)

Check if you have Node.js:

```bash
node --version
```

If not installed, the easiest way on macOS:

```bash
# Option A: download from https://nodejs.org (LTS recommended)
# Option B: if you use Homebrew
brew install node
```

You need Node.js 18 or later.

### Clone and install the project

```bash
git clone https://github.com/JSvandijk/t3code-mobile.git
cd t3code-mobile
npm install
```

### Start the proxy in HTTP mode

```bash
npm run start:iphone
```

This starts the proxy on `http://localhost:3780` in HTTP mode. It connects to T3 Code on `http://localhost:3773` and injects the PWA metadata that Safari needs.

If T3 Code runs on a different port, set it explicitly:

```bash
T3_TARGET=http://localhost:YOUR_PORT npm run start:iphone
```

You should see:

```
  ==========================================
  T3 Code Mobile PWA Proxy (HTTP)
  ==========================================
  Public URL: http://localhost:3780/
  Target:     http://127.0.0.1:3773/
  Timeout:    15000 ms
  TLS:        disabled (use behind Tailscale Serve or HTTPS proxy)
  ==========================================
```

### Expose via Tailscale Serve

In a second terminal, run:

```bash
tailscale serve https / http://localhost:3780
```

This tells Tailscale to:
- Serve `http://localhost:3780` over HTTPS
- Use a real Let's Encrypt certificate for your machine
- Make it accessible at `https://your-mac.tailnet-name.ts.net`

Verify it works by opening `https://your-mac.tailnet-name.ts.net` in a browser on your Mac. You should see the T3 Code interface.

## Step 5: Add To iPhone Home Screen

1. Open **Safari** on your iPhone.
2. Navigate to `https://your-mac.tailnet-name.ts.net` (use your actual Tailscale hostname).
3. T3 Code should load. If it asks you to pair, complete the pairing flow first.
4. Tap the **Share** button (the square with the arrow at the bottom of Safari).
5. Scroll down and tap **Add to Home Screen**.
6. The name should auto-fill as "T3 Code". Tap **Add**.
7. Open the app from your home screen.

The app now runs in fullscreen with no Safari address bar, no browser tabs, and a proper status bar. It behaves like a native app.

## Step 6: Pair With T3 Code

If you have not paired yet:

1. On your Mac, open T3 Code.
2. Go to `Settings` -> `Connections` -> `Create Link`.
3. Copy the pairing token.
4. In the iPhone PWA, complete the pairing flow using the token.

After pairing, the session is remembered. You can close and reopen the home screen app without re-pairing.

## Daily Use

Once set up, the daily workflow is:

1. Make sure T3 Code is running on your Mac.
2. Make sure the proxy is running (`npm run start:iphone` in the t3code-mobile directory).
3. Make sure Tailscale is connected on both devices.
4. Open the T3 Code app from your iPhone home screen.

**Important:** Your Mac must stay awake while you use the iPhone app. If your Mac goes to sleep, the proxy stops responding and the app will show a connection error. On macOS you can prevent sleep temporarily with `caffeinate -d` in a terminal, or adjust Energy Saver settings.

If you want the proxy to start automatically when you log in, you can add it as a login item or use a launchd plist on macOS.

## Keeping It Running (Optional)

To keep the proxy running in the background on macOS, you can use `pm2`:

```bash
npm install -g pm2
cd t3code-mobile
pm2 start "npm run start:iphone" --name t3code-proxy
pm2 save
pm2 startup
```

Or with a simple `nohup`:

```bash
cd t3code-mobile
nohup npm run start:iphone > proxy.log 2>&1 &
```

The `tailscale serve` configuration persists across reboots by default.

## Troubleshooting

### Safari shows "cannot connect" or a certificate warning

- Verify Tailscale is connected on both your Mac and iPhone.
- Verify you are using the correct Tailscale hostname (`your-mac.tailnet-name.ts.net`).
- Verify HTTPS certificates are enabled in the Tailscale admin panel.
- Open the URL in a browser on your Mac first to confirm it works locally.

### The page loads but does not look like an app

- Make sure you opened the page in **Safari** (not Chrome, Firefox, or another browser). Only Safari supports Add to Home Screen as a PWA on iOS.
- Make sure you used **Add to Home Screen**, not just bookmarked it.
- Close the Safari tab after adding to the home screen. Open the app from the home screen icon instead.

### The proxy cannot reach T3 Code

- Verify T3 Code is running on your Mac: open `http://localhost:3773` in a browser.
- If T3 Code uses a different port, set `T3_TARGET` when starting the proxy.

### The app shows a blank screen after opening from the home screen

- T3 Code might not be running on your Mac. Start it first.
- The proxy might not be running. Start it with `npm run start:iphone`.
- Tailscale might be disconnected. Check the Tailscale app on your iPhone.

### Image upload does not work

The PWA does not include the native image upload button that the Android app has. Use the standard T3 Code file attachment flow (drag and drop on desktop, or the built-in T3 Code upload if available).

### How to update

```bash
cd t3code-mobile
git pull
npm install
```

Then restart the proxy.

## What You Get

- Fullscreen T3 Code on your iPhone, no browser chrome
- Home screen icon that looks and opens like a native app
- Notch and safe area support for iPhone models with the Dynamic Island or notch
- Static assets cached via service worker (icons, manifest; the T3 Code UI itself is not cached offline)
- Smooth scrolling with bounce prevention
- Navigation stays inside the app (external links open in Safari)

## What Is Different From The Android App

The Android app (`T3Code.apk`) is a native WebView wrapper. The iPhone version is a Progressive Web App (PWA) running through Safari's standalone mode.

Differences:

| Feature | Android APK | iPhone PWA |
|---------|-------------|------------|
| Install method | APK sideload | Safari Add to Home Screen |
| Runs without browser | Yes (WebView) | Yes (Safari standalone) |
| Custom image upload button | Yes | No (use T3 Code built-in) |
| Connection diagnostics | Yes (in-app) | No |
| Offline support | No | Static assets only (icons, manifest) |
| Requires proxy | No | Yes |
| Requires Tailscale | Recommended | Required (for HTTPS) |
