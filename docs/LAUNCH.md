# Launch Copy

Use this when you publish the next release or refresh the public GitHub page.

## Repository Description

`Unofficial Android companion app and optional HTTPS/PWA proxy for T3 Code.`

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

`T3 Code Mobile: public release`

## Suggested Release Body

```md
## T3 Code Mobile: public release

T3 Code Mobile is an unofficial Android companion app for T3 Code, focused on fast self-hosted phone access over Tailscale or a trusted local network.

### What this release includes
- Native Android WebView wrapper for T3 Code
- One-time base URL setup with reconnect support
- Persistent inline image upload shortcut in the composer
- Optional HTTPS/PWA proxy for browser-based install flows
- Public docs, issue templates, CI, and contributor guidelines

### Why this repo exists
This project is intentionally narrow. It is not trying to replace T3 Code or become a full remote-agent platform. The goal is simpler: make an existing T3 Code session practical to use from a phone.

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

1. Add in-app server URL reset and edit flow
2. Improve WebView SSL error handling
3. Make composer button injection more resilient to upstream T3 DOM changes
4. Add connection diagnostics and friendlier error states
5. Improve screenshots and install docs for first-time users
