# Device Capture Checklist

Use this when you want a real-device evidence set instead of emulator-only proof.

## Before Capture

- Use a physical Android device with a current Android System WebView.
- Update the app to the exact commit or APK you intend to release.
- Remove personal notifications and private photos from view.
- Make sure no real pairing token, hostname, IP, or Tailnet name is visible.
- Decide whether the network path is Tailscale or LAN and record it.

## Capture Set

- Connect screen before first run
- Full pairing-style link pasted into the connect field
- Cleartext warning if HTTP is used
- Successful in-app load after connect
- Connection info dialog showing only the base URL
- Diagnostics report dialog
- Composer upload button visible in the real T3 UI
- Native Android photo picker visible
- Invalid HTTPS blocking screen

## Required Notes

- Device model
- Android version
- Android System WebView version
- App version
- T3 Code version
- Network path
- Release tag or commit SHA

## Good Enough Standard

- At least one clean screenshot for each required flow
- At least one short video or GIF for connect plus upload if you want stronger public proof
- A written note for any flow that could not be re-run and why
