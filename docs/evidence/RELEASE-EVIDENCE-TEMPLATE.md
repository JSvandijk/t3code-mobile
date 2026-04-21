# Release Evidence Template

Use this template for each public tag.

Recommended location:

- GitHub issue titled `Release evidence: vX.Y.Z`
- release note section named `Tested on`
- or a versioned repo file such as `docs/evidence/vX.Y.Z-device/README.md`

---

## Release Identity

- Release tag:
- Git commit SHA:
- Evidence author:
- Capture date:

## Automated Gates

- [ ] `npm test` passed on the release commit
- CI run link:
- APK build link or workflow run:
- SHA256 artifact confirmed:

## Test Environment

- Device type: physical device / emulator
- Device model or AVD:
- Android version:
- Android System WebView version:
- App version:
- T3 Code version:
- Network path: Tailscale / LAN / emulator loopback

## Runtime Flows

- [ ] First-run connect screen captured
  Artifact:
- [ ] Full pairing-style link accepted
  Artifact:
- [ ] Base URL normalization confirmed
  Artifact:
- [ ] Reconnect with saved server confirmed
  Artifact:
- [ ] Diagnostics path confirmed
  Artifact:
- [ ] Invalid HTTPS blocking confirmed
  Artifact:
- [ ] Composer upload flow confirmed
  Artifact:

## Evidence Links

- Screenshot set:
- Screen recording:
- Environment dump:
- Automated checks output:
- Extra logs:

## Known Gaps

- None

## Release Call

- [ ] Ready to ship
- [ ] Ready to ship with documented limitations
- [ ] Not ready to ship

## Notes

- Keep this evidence tied to the exact release commit.
- If a flow was not re-run because the code path was unchanged, say that explicitly and link the previous evidence set.
