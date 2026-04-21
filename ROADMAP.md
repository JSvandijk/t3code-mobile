# Roadmap

This roadmap is intentionally short and practical. The goal is to make the project easier to trust, easier to use, and easier to contribute to.

## Current Priorities

- Add emulator or device smoke coverage for HTTP, HTTPS, and blocked certificate flows
- Deepen connection diagnostics with device-specific WebView failure notes
- Harden SSL, mixed-content, and permission handling further
- Make the composer image button more resilient to upstream T3 UI changes
- Improve automated release notes and release testing
- Build a stronger public evidence set with fresh screenshots and a short demo clip

## Good First Issue Candidates

- Improve README screenshots and demo assets
- Add clearer error copy for common connection failures
- Tighten issue templates based on real reports
- Add small Android UI polish on the connect screen
- Improve troubleshooting docs for pairing and Tailscale
- Add tested-device notes for real Android hardware and WebView versions

## Medium-Sized Improvements

- Better upload flow fallback when the current selector strategy fails
- Settings screen for connection preferences
- Better logging for WebView and proxy failures
- Device lab notes for tested Android/WebView versions
- Expand the local harness with more realistic upstream DOM fixtures if T3 UI changes start breaking selector assumptions

## Not The Goal

- turning this into a hosted SaaS
- rebuilding the full T3 Code product
- adding broad multi-provider orchestration unrelated to mobile access
