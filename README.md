# T3 Code Mobile

[![CI](https://github.com/JSvandijk/t3code-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/JSvandijk/t3code-mobile/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-0f172a.svg)](LICENSE)
[![Platform: Android](https://img.shields.io/badge/platform-Android-6C63FF.svg)](#installation)
[![Platform: iPhone PWA](https://img.shields.io/badge/platform-iPhone%20PWA-000000.svg)](IPHONE-GUIDE.md)
[![Network: Tailscale-friendly](https://img.shields.io/badge/network-Tailscale--friendly-57d6c4.svg)](INSTALLATION-GUIDE.md)

An unofficial Android and iPhone companion app with optional HTTPS/PWA proxy for [T3 Code](https://github.com/pingdotgg/t3code).

> The lightweight, browserless, reliability-first way to use T3 Code on your phone.

`t3code-mobile` is built for one specific job: make your own T3 Code session usable from your phone with the least possible setup friction. On Android, it wraps T3 Code in a fullscreen WebView with an inline photo upload shortcut. On iPhone, it runs as a fullscreen Progressive Web App through Safari with home screen integration, notch support, and offline caching.

The pitch is simple: reliable, browserless, lightweight T3 access on your phone. This repo does not try to become a heavy mobile control plane. It tries to be the cleanest and most dependable way to use your existing T3 Code session from a phone.

## Why It Stands Out

- It feels like a focused Android companion app, not a mobile browser tab.
- It accepts full pairing-style links but stores only the base URL.
- It keeps mobile reliability work visible: diagnostics, SSL blocking, scoped navigation, harness coverage, and release evidence.
- It stays deliberately narrow instead of turning into a heavier remote-agent dashboard.

## Evaluate It Fast

- Product proof: screenshots below plus [docs/SHOWCASE.md](docs/SHOWCASE.md)
- Technical proof: [docs/evidence/v1.1.0-emulator/README.md](docs/evidence/v1.1.0-emulator/README.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Reproducible local checks: [docs/WEBVIEW-HARNESS.md](docs/WEBVIEW-HARNESS.md)

## At A Glance

- Browserless experience on Android (native WebView) and iPhone (fullscreen PWA)
- Lightweight companion scope instead of a broader remote-agent dashboard
- Reliability-first behavior: diagnostics, scoped navigation, smoke tests, and visible failure handling
- Fast self-hosted phone access over Tailscale or a trusted local network

## Screenshots

<table>
  <tr>
    <td width="33%"><img src="docs/images/browserless-chat.jpg" alt="T3 Code Mobile browserless in-chat view" /></td>
    <td width="33%"><img src="docs/images/mobile-project-list.jpg" alt="T3 Code Mobile project and chat list" /></td>
    <td width="33%"><img src="docs/images/native-photo-picker.jpg" alt="T3 Code Mobile native Android photo picker" /></td>
  </tr>
  <tr>
    <td><strong>Browserless in-chat use</strong><br />A focused mobile T3 session inside the app, not a generic browser tab.</td>
    <td><strong>Lightweight project workflow</strong><br />Fast mobile navigation without turning the app into a heavy dashboard.</td>
    <td><strong>Native Android upload</strong><br />Photo selection stays inside the T3 mobile flow through the Android picker.</td>
  </tr>
</table>

Browserless in-chat use, a lightweight mobile project list, and native Android photo upload are the three things this repo needs to prove quickly on GitHub. The app should look like a focused mobile companion, not a browser tab and not a heavy remote-agent dashboard.

## Why This Project Exists

The upstream T3 Code project is the real product. This repository is intentionally narrower:

- It is mobile-first and self-hosted.
- It assumes you already run T3 Code on your main machine.
- It optimizes for quick phone access over Tailscale or a trusted LAN.
- It stays lightweight instead of becoming a broader remote-agent platform.

If that is the exact problem you have, this repo is deliberately small enough to understand, modify, and improve. Less product surface is a feature here: fewer moving parts, less UI clutter, and fewer opportunities for mobile-specific breakage.

## Why This Is More Than A Simple Wrapper

The interesting work in this repo is not "open a website in a WebView." The value comes from handling the sharp edges around that idea:

- The app accepts a full T3 pairing link, extracts only the base URL, and avoids storing the token in app state.
- The WebView stays scoped to the configured T3 host instead of turning into a general browser shell.
- The inline upload control is reinjected after SPA navigation so the feature survives real T3 UI transitions.
- The app produces copyable connection diagnostics instead of leaving users with a blank "it failed" state.
- The optional proxy adds installable PWA behavior and a machine-readable health endpoint for support and smoke testing.

If another T3 user or contributor opens this repo, they should be able to see both the product value and the engineering discipline quickly.

## What You Get

- Native Android WebView wrapper with no browser chrome
- iPhone and iPad support via fullscreen PWA with home screen integration
- One-time base URL setup with reconnect support
- Full pairing links can be pasted; the app extracts and saves only the base URL
- In-app menu for reload, connection info, and changing the saved server
- Copyable in-app diagnostics report with HTTP, SSL, and network summaries
- Persistent inline image upload button next to the composer controls
- MutationObserver-based reinjection so the upload button survives SPA navigation
- Optional HTTPS reverse proxy that adds a manifest, service worker, installable PWA behavior, and a health endpoint
- HTTP mode for the proxy when running behind Tailscale Serve or another HTTPS reverse proxy
- Portable local WebView harness for HTTP, invalid-HTTPS, and redirect testing
- Windows-friendly APK build flow without needing a full Gradle project workflow
- Proxy smoke test that verifies HTML injection, static assets, and the proxy health endpoint
- Tag-driven GitHub release flow with versioned APKs and checksum output

## Engineering Highlights

- Browserless mobile access: the Android wrapper removes browser chrome and keeps the session focused on T3 Code.
- Safer pairing flow: full pairing links are accepted for convenience, but only the base server URL is stored.
- Support-first diagnostics: HTTP, SSL, and network details can be copied from inside the app for faster triage.
- Resilient upload UX: the photo button is restored after upstream SPA transitions rather than relying on a one-shot DOM injection.
- Testable proxy mode: the optional HTTPS proxy exposes `GET /__t3mobile/health`, reports upstream latency, and has a smoke test for HTML injection and assets.
- Contributor-ready harness: `npm run harness:http`, `harness:https-bad-cert`, and `harness:redirect` make Android WebView behavior reproducible.
- CI-safe proxy smoke test: the proxy test can generate temporary self-signed certificates when local TLS files are absent.
- Upstream-friendly scope: the repo stays narrow enough to complement T3 Code instead of drifting into a general remote-agent product.

## Quick Start

### Android

1. Install Tailscale on your computer and Android phone.
2. Open T3 Code on your computer.
3. In T3 Code, go to `Settings` -> `Connections` -> `Create Link`.
4. Install the APK on Android.
5. Enter your base URL, for example `http://your-t3-host:3773`.
6. Complete the standard pairing flow using the token from the desktop app.

### iPhone

1. Install Tailscale on your computer and iPhone.
2. Start the PWA proxy: `npm run start:iphone`
3. Expose via Tailscale: `tailscale serve https / http://localhost:3780`
4. Open `https://your-machine.tailnet.ts.net` in Safari on your iPhone.
5. Tap Share -> Add to Home Screen.

Detailed instructions: [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md) (Android) | [IPHONE-GUIDE.md](IPHONE-GUIDE.md) (iPhone)

## Project Layout

- `apk/`: Android app source
- `server.js`: optional HTTPS reverse proxy for PWA mode
- `webview-harness.js`: local HTTP and invalid-HTTPS harness for Android runtime checks
- `manifest.json` and `sw.js`: installable PWA assets
- `build-apk.bat`: Windows APK build script
- `generate-icons.js`: icon generation helper
- `harness-pages/`: static harness and English demo pages used by the local WebView test server
- `docs/`: comparison notes, publishing checklist, screenshots, and showcase docs

If you are picking this project up in a new chat or after time away, read [docs/CHAT-CONTEXT.md](docs/CHAT-CONTEXT.md) first for the current handoff.

## Build And Run

### Build The APK

Requirements:

- Windows
- Android SDK with `build-tools 36.1.0`
- Android platform `android-35`
- JDK 11+
- PowerShell 5+

```bat
build-apk.bat
```

This builds `apk/build/output/T3Code-v<version>.apk`, copies the same file to the repo root as both `T3Code.apk` and `T3Code-v<version>.apk`, and injects Android `versionCode` and `versionName` from `package.json`.

Without release-signing environment variables, the script uses a local development keystore and prints a warning. That output is fine for local testing but not for public GitHub releases or cross-machine update compatibility.

If you want Android users to receive in-place APK upgrades across releases, keep the public release signing key stable. Changing the signing key forces users to uninstall the old app before installing the new one.

For stable public updates, configure these GitHub Actions secrets and publish with a tag that matches `package.json`, for example `v1.1.0`:

- `APK_KEYSTORE_BASE64`
- `APK_KEYSTORE_PASSWORD`
- `APK_KEY_ALIAS`
- `APK_KEY_PASSWORD`

If you still have the previous public signing key and need to recover Android update continuity after an accidental key change, the build also supports APK Signature Scheme v3 rotation and signing lineage. Add these optional GitHub Actions secrets for the next recovery release:

- `APK_OLD_KEYSTORE_BASE64`
- `APK_OLD_KEYSTORE_PASSWORD`
- `APK_OLD_KEY_ALIAS`
- `APK_OLD_KEY_PASSWORD`
- `APK_SIGNING_LINEAGE_BASE64` (optional if you already have a lineage file to extend)
- `APK_ROTATION_MIN_SDK_VERSION` (optional, defaults to `28`)

That recovery path only works if the old release key still exists. If the old private key is gone, Android users already on the mismatched release cannot be migrated in place.

### Run The Optional PWA Proxy

Use this mode if you want an installable browser version instead of the native APK.

```bash
npm install
npm start
```

Set the environment variables from [.env.example](.env.example) if you need custom paths or ports. The proxy expects valid TLS files via `SSL_KEY_PATH` and `SSL_CERT_PATH`.

The proxy also exposes `GET /__t3mobile/health`, which returns JSON about the proxy process, the configured upstream timeout, upstream reachability, and probe latency.

## How It Works

- The Android app opens your T3 Code instance in a fullscreen WebView.
- The app keeps navigation scoped to the configured T3 server; other links are handed off to the device browser.
- The app can generate a copyable diagnostics report with the current URL, active network, HTTP probe results, and last-known SSL or HTTP failure details.
- After each page load, the app injects a custom image button into the composer footer.
- A hidden file input is recreated when needed during SPA navigation.
- Selected images are passed into T3 Code through a `ClipboardEvent` paste flow.
- The optional proxy injects PWA metadata and service worker registration into the upstream HTML, keeps upstream connections alive for lighter reconnects, and exposes a lightweight health endpoint for smoke tests and troubleshooting.

## Architecture

![T3 Code Mobile architecture overview](docs/images/architecture-overview.svg)

If you want the technical breakdown instead of the public pitch, read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentation

| Area | Link |
|------|------|
| Architecture | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Runtime evidence | [docs/evidence/README.md](docs/evidence/README.md) |
| Runtime verification | [docs/RUNTIME-VERIFICATION.md](docs/RUNTIME-VERIFICATION.md) |
| Security audit | [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) |
| WebView harness | [docs/WEBVIEW-HARNESS.md](docs/WEBVIEW-HARNESS.md) |
| Release runbook | [docs/RELEASE-RUNBOOK.md](docs/RELEASE-RUNBOOK.md) |
| Publishing checklist | [docs/PUBLISHING-CHECKLIST.md](docs/PUBLISHING-CHECKLIST.md) |
| Showcase | [docs/SHOWCASE.md](docs/SHOWCASE.md) |
| Comparison | [docs/COMPARISON.md](docs/COMPARISON.md) |
| Starter issues | [docs/STARTER-ISSUES.md](docs/STARTER-ISSUES.md) |

## Security Notes

- The app no longer proceeds past invalid TLS certificates.
- HTTPS is preferred when you can issue a trusted certificate.
- Cleartext HTTP remains supported for Tailscale or another trusted private network because that is a core self-hosted use case, but the app now warns before every HTTP session.
- The app intentionally stays scoped to one configured server host inside the WebView; other destinations open outside the app.

See [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) for the current audit notes, fixes, and remaining tradeoffs.

## Contributing

If you want to help this become a stronger community project, start here:

- Read [CONTRIBUTING.md](CONTRIBUTING.md)
- Check [ROADMAP.md](ROADMAP.md)
- Look for issues labeled `good first issue` or `help wanted`
- Use the issue forms for bug reports and feature proposals

High-value contribution areas right now:

- automated Android runtime smoke tests
- safer SSL and network handling
- more resilient composer button injection
- richer diagnostics for device-specific WebView failures
- better onboarding docs and screenshots

## Community

- [SUPPORT.md](SUPPORT.md) — how to get help
- [SECURITY.md](SECURITY.md) — vulnerability reporting
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)

## Status

This repo is public and usable today, but still early. The current priority is reliability, better onboarding, and making it easy for outside contributors to help without having to reverse-engineer the codebase.

- **Android**: tested on real devices and emulators. Considered stable for daily use.
- **iPhone (PWA)**: proxy code passes all automated tests and follows Apple's PWA specifications, but has not yet been verified on a real iPhone. Treat it as an early preview until confirmed working on-device.

Android runtime verification is intentionally split into automated repo gates and explicit Android-side evidence capture. The exact proof required for public releases now lives in [docs/RUNTIME-VERIFICATION.md](docs/RUNTIME-VERIFICATION.md), and the release bar itself is documented in [docs/RELEASE-RUNBOOK.md](docs/RELEASE-RUNBOOK.md).

## Positioning

This repo is not trying to compete with broader remote-agent projects. It is a narrower companion app for T3 Code users who want the smallest practical path from desktop to phone.

See [docs/COMPARISON.md](docs/COMPARISON.md) for a short comparison against upstream T3 Code and related mobile-first projects.

## Disclaimer

This is an unofficial companion project. It is not affiliated with, endorsed by, or maintained by Ping.gg or Theo Browne.

## License

MIT
