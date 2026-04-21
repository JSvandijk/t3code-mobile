# Screenshot Guide

Use this guide to keep GitHub screenshots, release assets, and social posts consistent and useful.

## Rules

- Prefer English labels and demo text when practical.
- Never show a real token, private hostname, IP address, or Tailnet name.
- Prefer tall mobile screenshots with clean spacing and no notification clutter.
- Use product screenshots to show value, not just the existence of a screen.
- Put the strongest screenshots near the top of the README, not buried deep in the docs.
- Keep at least one screenshot in the README and one wider asset for GitHub social preview.

## Approved Screenshot Set

| File | Purpose | Recommended caption |
| --- | --- | --- |
| `docs/images/browserless-chat.jpg` | Browserless in-app proof | `A focused in-app T3 session on Android, not a generic browser tab.` |
| `docs/images/mobile-project-list.jpg` | Mobile workflow proof | `Project and chat navigation stays lightweight and readable on a phone.` |
| `docs/images/native-photo-picker.jpg` | Native upload support | `Use the Android photo picker without leaving the T3 mobile flow.` |
| `docs/images/social-preview.png` | GitHub social preview | `Android WebView + Tailscale + optional PWA proxy.` |

For the current GitHub-facing screenshot set, capture the project-list and workspace views from the harness demo routes when you need clean English UI:

- `http://10.0.2.2:4888/demo/workspace`
- `http://10.0.2.2:4888/demo/projects`

## Capture Checklist

- Use placeholder hosts such as `http://your-t3-host:3773` when a URL must be shown.
- Crop away emulator chrome unless it adds useful context.
- Make sure the CTA text is readable at GitHub README scale.
- Verify there are no personal files visible in the upload flow.
- Keep the browserless in-chat screenshot in the README because it proves the core product claim fastest.
- Prefer real-device screenshots over local harness shots when choosing homepage assets.

## When To Refresh Screenshots

- After any connect or onboarding flow change
- After any project-list or navigation layout change
- After any composer-button design or placement change
- Before every public release if the README screenshots are more than one release old
