# Architecture Overview

This project is intentionally small. That is part of the design.

The architecture is built around one narrow goal: make an existing self-hosted T3 Code session usable from Android with minimal setup friction and better reliability than a raw browser tab.

![T3 Code Mobile architecture overview](images/architecture-overview.svg)

## Main Pieces

### Android wrapper

`apk/app/src/main/java/com/t3code/app/MainActivity.java`

Responsibilities:

- collect and normalize the server URL
- store only the base URL, not the full pairing token URL
- warn before HTTP sessions
- keep navigation scoped to the configured T3 host
- show diagnostics and connection info
- inject and maintain the upload button inside the live T3 UI
- block invalid HTTPS certificates

### Optional proxy / PWA mode

`server.js`

Responsibilities:

- proxy an upstream T3 target over HTTPS
- inject PWA assets into upstream HTML
- expose static manifest, icons, and service worker assets
- expose `GET /__t3mobile/health`
- provide a controlled failure page when the upstream session is unavailable

### Verification layer

Primary files:

- `smoke-proxy.js`
- `webview-harness.js`
- `check-release.js`
- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`

Responsibilities:

- keep repo hygiene and release discipline enforced
- smoke-test the proxy path and injected assets
- provide reproducible HTTP, invalid-HTTPS, and redirect harness scenarios
- keep release evidence tied to a specific tag or commit

## Design Constraints

This repo is opinionated because the constraints are opinionated:

- Android-first instead of multi-platform abstraction
- narrow companion app instead of a broader remote-agent platform
- self-hosted and Tailscale-friendly instead of public-internet-first
- reliability and supportability over feature sprawl

## Why This Shape Matters

A lot of the real work here is around the edges:

- safe pairing-link handling
- scoped navigation boundaries
- SPA-resistant upload-button reinjection
- copyable diagnostics
- public-repo evidence and release discipline

That is the difference between a throwaway WebView wrapper and a repo that can hold up as a public engineering project.
