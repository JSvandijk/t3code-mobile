# Publishing Checklist

Use this before creating a public release or making a broader push for stars, users, and contributors.

## Repository Metadata

- Set the repository description to: `Unofficial Android companion app and optional HTTPS/PWA proxy for T3 Code.`
- Set the website/homepage to the latest GitHub Release or the repo README
- Add focused topics such as `t3-code`, `android`, `tailscale`, `self-hosted`, `webview`, `pwa`, `remote-access`, `mobile-companion`
- Upload `docs/images/social-preview.png` as the GitHub social preview image
- Enable Issues and Discussions if you want community support to happen in public

## README And Docs

- Confirm the README still matches the current app behavior
- Keep all public docs in English
- Keep at least one current screenshot in the README
- Make sure no tokens, private URLs, or personal IPs appear anywhere in docs or screenshots
- Keep the disclaimer visible

## Release Asset

- Build a fresh APK from a clean working tree
- Install it on a second Android device
- Test first-run pairing
- Test reconnect with the saved URL
- Test the photo upload button in a real chat
- Note the Android version, device model, and T3 Code version tested

## Optional PWA Mode

- Verify `cert.pem` and `key.pem` are not committed
- Verify the proxy works with your intended `PUBLIC_URL`
- Test install flow in Chrome on Android

## Community Readiness

- Create at least 3 starter issues before announcing the repo
- Label approachable work with `good first issue`
- Label broader contributor work with `help wanted`
- Respond quickly to the first external bug reports and pull requests
- Keep `ROADMAP.md` realistic so contributors can see where help is useful

## Release Notes

- Tag a version before publishing a release
- Upload the APK as a GitHub Release asset instead of committing binaries
- Use GitHub's automatically generated release notes, then edit the intro paragraph by hand
- Include a short tested-on note and any known limitations
- Link to [COMPARISON.md](COMPARISON.md) so readers understand project scope immediately
