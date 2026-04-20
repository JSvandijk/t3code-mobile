# Publishing Checklist

Use this before sharing the repository publicly or creating a release.

## Repository

- Confirm the README matches what the app actually does today
- Confirm all visible docs are in English
- Add screenshots or a short demo GIF if you want stronger GitHub presentation
- Make sure no tokens, private URLs, or personal IPs remain in code or docs
- Confirm the disclaimer stays visible and accurate

## Release Asset

- Build a fresh APK from a clean working tree
- Install it on a second Android device
- Test first-run pairing
- Test reconnect with the saved URL
- Test the photo upload button in a real chat

## Optional PWA Mode

- Verify `cert.pem` and `key.pem` are not committed
- Verify the proxy works with your intended `PUBLIC_URL`
- Test install flow in Chrome on Android

## GitHub Hygiene

- Tag a version before publishing a release
- Upload the APK as a GitHub Release asset instead of relying on a committed binary
- Add a short release note describing the device and T3 Code version you tested against
- Link to [COMPARISON.md](COMPARISON.md) so readers understand the project scope immediately
