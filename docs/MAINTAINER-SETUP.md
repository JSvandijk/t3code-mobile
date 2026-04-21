# Maintainer Setup

Use this checklist to keep the public repository configuration aligned with the files in this repo.

## GitHub Settings

- Default branch: `main`
- Branch protection on `main`
  - require status checks: `node-checks`, `android-build`
  - disable force pushes
  - disable branch deletion
- Enable Issues
- Enable Discussions if you want public community support
- Enable private vulnerability reporting

## Recommended Labels

- `android`
- `bug`
- `chore`
- `community`
- `dependencies`
- `docs`
- `enhancement`
- `good first issue`
- `help wanted`
- `proxy`
- `release:highlight`
- `security`
- `triage`

## Release Hygiene

- Keep `.github/workflows/ci.yml` and `.github/workflows/release.yml` green before tagging
- Require a reviewer to confirm runtime evidence is attached or linked before merging release-sensitive changes
- Create a Git tag for each public release
- Configure these GitHub Actions secrets for release signing:
  - `APK_KEYSTORE_BASE64`
  - `APK_KEYSTORE_PASSWORD`
  - `APK_KEY_ALIAS`
  - `APK_KEY_PASSWORD`
- If you ever need to recover from an accidental release-key change and the previous key still exists, also configure:
  - `APK_OLD_KEYSTORE_BASE64`
  - `APK_OLD_KEYSTORE_PASSWORD`
  - `APK_OLD_KEY_ALIAS`
  - `APK_OLD_KEY_PASSWORD`
  - `APK_SIGNING_LINEAGE_BASE64` (optional if you already have a lineage file)
  - `APK_ROTATION_MIN_SDK_VERSION` (optional, defaults to `28`)
- Push a tag that matches `package.json`, for example `v1.1.0`
- Let `.github/workflows/release.yml` publish the versioned APK and checksum
- Include tested Android version, Android System WebView version, and device notes
- Keep [docs/RUNTIME-VERIFICATION.md](docs/RUNTIME-VERIFICATION.md) aligned with the current evidence bar
- Keep [docs/RELEASE-RUNBOOK.md](docs/RELEASE-RUNBOOK.md) aligned with the actual release flow
- Keep [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md) current when security-sensitive behavior changes

## Community Signals

- Keep at least a few starter issues open
- Keep issue labels accurate
- Keep the social preview image current
- Review `CODEOWNERS` when maintainership changes
