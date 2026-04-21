# Runtime Verification

This project treats runtime proof as a release artifact, not as a vague maintainer memory.

## Evidence Layers

Every meaningful change should be covered by the strongest relevant layer:

- `npm test` for repo gates, proxy smoke checks, manifest validation, and release-discipline checks
- `npm run harness:http`, `npm run harness:https-bad-cert`, and `npm run harness:redirect` for repeatable Android WebView scenarios
- manual Android verification on a real device or emulator when app behavior, WebView behavior, permissions, navigation, uploads, diagnostics, or SSL handling changed

## Minimum Android Evidence For Public Releases

Record the following for the exact commit or tag being released:

- Git commit SHA or release tag
- Device model or emulator profile
- Android version
- Android System WebView version
- T3 Code version tested
- Network path used: Tailscale, LAN, or emulator loopback

Capture proof for these flows:

| Flow | Required proof |
| --- | --- |
| First-run connect | Screenshot or short recording of the connect screen and a successful load |
| Pair-link handling | Note that a full pairing link was accepted and only the base URL was retained |
| Reconnect | Screenshot or note showing the saved base URL reconnect path |
| Composer upload | Screenshot of the injected button and confirmation that image selection reached the composer flow |
| SSL blocking | Screenshot of the invalid-certificate error state from the harness or a controlled test target |
| Diagnostics | Screenshot or pasted report excerpt showing the diagnostics path still works |

## Where To Store Evidence

Use one of these locations:

- a linked PR comment for change-specific verification
- a release note section named `Tested on`
- a dedicated GitHub issue used as a runtime evidence log
- a versioned folder under [`docs/evidence/`](evidence/README.md) when you want the proof to live in-repo

Keep evergreen screenshots in `docs/images/`. Keep one-off verification artifacts out of the repository root.

Example:

- [`docs/evidence/v1.1.0-emulator/`](evidence/v1.1.0-emulator/README.md)
- [`docs/evidence/RELEASE-EVIDENCE-TEMPLATE.md`](evidence/RELEASE-EVIDENCE-TEMPLATE.md)
- [`docs/evidence/DEVICE-CAPTURE-CHECKLIST.md`](evidence/DEVICE-CAPTURE-CHECKLIST.md)

## Release Bar

Do not publish a public release unless all of these are true:

- `npm test` passed on the release commit
- the Android evidence above was captured or explicitly re-confirmed against unchanged code paths
- any known gaps are called out in the release notes

If a change touches only documentation or repository metadata, link the green CI run and note that no runtime behavior changed.
