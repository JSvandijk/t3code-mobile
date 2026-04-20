# t3code-mobile

Unofficial Android companion and optional HTTPS PWA proxy for [T3 Code](https://github.com/pingdotgg/t3code).

This project wraps a local T3 Code desktop instance in a lightweight mobile experience. It is focused on one job: making your own T3 Code session usable from an Android phone over Tailscale or a trusted local network, with a persistent photo upload shortcut inside the chat composer.

## What This Repo Includes

- A native Android WebView wrapper for T3 Code
- A persistent image upload button injected into the composer UI
- Saved server URL so pairing is a one-time setup
- An optional HTTPS proxy + PWA layer for browser-based install flows
- Simple Windows build scripts for generating the APK without Gradle

## Why This Exists

The official `pingdotgg/t3code` project is the upstream inspiration and the real product. This repository intentionally stays much smaller and more opinionated:

- It is mobile-first
- It is designed around personal/self-hosted access
- It assumes you already run T3 Code on your main machine
- It prioritizes quick phone access over a full remote agent management platform

## Core Features

- Fullscreen Android app with no browser chrome
- Inline photo upload shortcut placed next to the existing composer controls
- MutationObserver-based reinjection so the button survives chat switches
- Tailscale-friendly connection flow
- Remembered base URL for fast reconnects
- Optional PWA proxy for users who want an installable browser version

## Project Layout

- `apk/`: Android app source and launcher icons
- `server.js`: optional HTTPS reverse proxy that injects PWA metadata
- `manifest.json` and `sw.js`: installable PWA files for the proxy mode
- `build-apk.bat`: main Windows build script
- `generate-icons.js`: regenerates the public and Android icon assets

## Installation

Use the full guide in [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md).

Quick path:

1. Install Tailscale on your computer and Android phone.
2. Install and open T3 Code on your computer.
3. In T3 Code, open `Settings` -> `Connections` -> `Create Link`.
4. Install the APK on Android.
5. Enter your base URL such as `http://your-t3-host:3773`.
6. Complete the pairing flow with the token from the desktop app.

## Building The APK

Requirements:

- Windows
- Android SDK with `build-tools 36.1.0`
- Android platform `android-35`
- JDK 11+

Run:

```bat
build-apk.bat
```

The script builds `apk/build/output/T3Code.apk` and copies it to the repo root as `T3Code.apk`.

## Running The Optional PWA Proxy

The proxy mode is useful if you want a browser-installable version instead of the native APK.

1. Create or supply `key.pem` and `cert.pem` in the repo root.
2. Copy `.env.example` values into your environment if needed.
3. Install dependencies with `npm install`.
4. Start the proxy with `npm start`.
5. Open the HTTPS URL from your phone and install it as a PWA.

## How It Works

- Android loads T3 Code inside a fullscreen WebView
- After each page load, JavaScript injects a photo button into the composer footer
- A hidden file input is recreated when needed during SPA navigation
- Selected images are pasted into T3 Code through a `ClipboardEvent`
- The optional proxy injects a web manifest, service worker registration, and mobile meta tags into the upstream HTML

## Comparison And Positioning

This repo is not trying to compete with broader remote-agent projects such as Yep Anywhere, AgentOS, or CloudCLI UI. It is a narrower companion app for T3 Code users who want the smallest possible path from desktop to phone.

See [docs/COMPARISON.md](docs/COMPARISON.md) for a short comparison against the upstream T3 Code repo and related mobile-first projects.

## Inspiration And Credit

- Upstream inspiration: [pingdotgg/t3code](https://github.com/pingdotgg/t3code)
- This repo builds around the T3 Code desktop pairing flow and mobile access pattern
- Related projects are listed in [docs/COMPARISON.md](docs/COMPARISON.md)

## Disclaimer

This is an unofficial companion project. It is not affiliated with, endorsed by, or maintained by Ping.gg or Theo Browne.

## License

MIT
