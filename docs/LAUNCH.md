# Launch Copy

Use this when you publish the next release or refresh the public GitHub page.

## Repository Description

`The lightweight, browserless, reliability-first Android companion app for T3 Code.`

## Suggested Topics

- `t3-code`
- `android`
- `android-app`
- `tailscale`
- `self-hosted`
- `webview`
- `pwa`
- `remote-access`
- `mobile-companion`

## Suggested Release Title

`T3 Code Mobile: lightweight browserless T3 on Android`

## Suggested Release Body

```md
## T3 Code Mobile: public release

T3 Code Mobile is an unofficial Android companion app for T3 Code, focused on lightweight, browserless phone access over Tailscale or a trusted local network.

### What this release includes
- Native Android WebView wrapper for T3 Code
- One-time base URL setup with reconnect support
- Full pairing-link paste support while storing only the base URL
- Persistent inline image upload shortcut in the composer
- Optional HTTPS/PWA proxy for browser-based install flows
- In-app connection diagnostics and proxy health checks
- Public docs, issue templates, CI, and contributor guidelines

### Why this repo exists
This project is intentionally narrow. It is not trying to replace T3 Code or become a full remote-agent platform. The goal is simpler: make an existing T3 Code session practical, reliable, and pleasant to use from a phone.

### Why contributors may care
- It tackles real self-hosted mobile reliability problems instead of building a generic browser shell
- It includes visible support work: diagnostics, smoke tests, and narrow security boundaries
- It stays small enough for targeted pull requests and practical experimentation

### Strongest differentiator
- The Android app keeps T3 Code in a fullscreen mobile shell with no browser URL bar
- The project stays intentionally lightweight instead of becoming a heavier dashboard or agent control plane
- Reliability and low-friction mobile access matter more here than feature sprawl

### Best fit
- people already running T3 Code on their main machine
- people using Tailscale or another trusted network
- contributors who want a small, understandable codebase to improve

### Known limitations
- The image upload button depends on the current T3 UI structure
- The Android wrapper is still intentionally lightweight
- The optional proxy should be treated as self-hosted infrastructure, not a hardened public internet gateway

Feedback, issues, and targeted pull requests are welcome.
```

## Suggested Starter Issues

Open a few issues before announcing the repo publicly:

1. Add device notes for tested Android versions and WebView versions
2. Add emulator or device smoke tests for HTTP, HTTPS, and blocked certificate flows
3. Improve WebView SSL and timeout diagnostics on real devices
4. Make composer button injection more resilient to upstream T3 DOM changes
5. Improve screenshots and install docs for first-time users

## Assets To Link In The Announcement

- `README.md`
- `docs/SHOWCASE.md`
- `docs/SCREENSHOTS.md`
- `docs/WEBVIEW-HARNESS.md`
- `docs/COMPARISON.md`
