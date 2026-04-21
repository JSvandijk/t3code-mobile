# Screenshot Guide

Use this guide to keep GitHub screenshots, release assets, and social posts consistent and English-only.

## Rules

- Keep all screenshot text in English.
- Never show a real token, private hostname, IP address, or Tailnet name.
- Prefer tall mobile screenshots with clean spacing and no notification clutter.
- Use product screenshots to show value, not just the existence of a screen.
- Keep at least one screenshot in the README and one wider asset for GitHub social preview.

## Approved Screenshot Set

| File | Purpose | Recommended caption |
| --- | --- | --- |
| `docs/images/connect-screen.png` | First-run mobile setup | `Connect to your T3 Code desktop app without browser chrome.` |
| `docs/images/pair-link-input.png` | Pairing-link convenience | `Paste the full pairing link. The app keeps only the base URL.` |
| `docs/images/composer-upload.png` | Inline upload support | `Use the photo shortcut directly inside the T3 composer.` |
| `docs/images/test-harness.png` | Engineering proof | `Local harness used to verify upload injection and paste flow.` |
| `docs/images/social-preview.png` | GitHub social preview | `Android WebView + Tailscale + optional PWA proxy.` |

## Capture Checklist

- Use placeholder hosts such as `http://your-t3-host:3773`.
- Crop away emulator chrome unless it adds useful context.
- Make sure the CTA text is readable at GitHub README scale.
- Verify there are no personal files visible in the upload flow.
- Re-export any screenshot that still contains Dutch copy or old UI labels.
- If the harness UI changes, refresh `docs/images/test-harness.png` so the engineering proof stays current.

## When To Refresh Screenshots

- After any connect-screen copy change
- After any pairing-flow change
- After any composer-button design or placement change
- Before every public release if the README screenshots are more than one release old
