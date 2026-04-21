# Release Runbook

Use this as the source of truth for public releases.

## Release Bar

A tag is release-ready only when all of the following are true:

- `npm test` passes on the exact commit being tagged
- CI is green
- the APK is built from a clean working tree
- runtime evidence required by [RUNTIME-VERIFICATION.md](RUNTIME-VERIFICATION.md) is attached or linked
- release signing secrets are configured
- the release keystore has not been rotated in a way that breaks Android upgrade continuity
- no TLS keys, certificates, `.env` files, or generated release artifacts are tracked in git

## Preflight

Run these from the repository root:

```bash
npm ci
npm test
```

Then verify:

- `package.json` version is final
- `README.md`, `SECURITY.md`, and release-facing docs still match the product
- screenshots and showcase notes are current enough for the release you are about to publish
- the release keystore still matches the signing identity used for the previous public APK if you want users to update in place

## Build And Publish

1. Tag the exact release commit with the matching version, for example `v1.1.0`.
2. Push the tag.
3. Let `.github/workflows/release.yml` build the signed APK and checksum.
4. Open or update a runtime evidence record using [docs/evidence/RELEASE-EVIDENCE-TEMPLATE.md](evidence/RELEASE-EVIDENCE-TEMPLATE.md) or the `Runtime evidence` issue form.
5. Review the generated GitHub Release before sharing it publicly.

## Required Release Notes Content

Every public release should include:

- a one-paragraph summary of what changed
- a short `Tested on` note with device, Android, WebView, and T3 Code versions
- a link to the runtime evidence record for that tag
- any known limitations that still matter to new users or contributors

## Hard Stops

Do not ship if any of these happen:

- the tag does not match `package.json`
- `npm test` fails
- signing falls back to a development keystore
- the release keystore changed unintentionally and would break APK upgrade continuity
- runtime evidence is missing for Android- or proxy-affecting changes
- the repo contains tracked secrets or generated release artifacts
