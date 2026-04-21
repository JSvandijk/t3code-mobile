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

- Create a Git tag for each public release
- Configure these GitHub Actions secrets for release signing:
  - `APK_KEYSTORE_BASE64`
  - `APK_KEYSTORE_PASSWORD`
  - `APK_KEY_ALIAS`
  - `APK_KEY_PASSWORD`
- Push a tag that matches `package.json`, for example `v1.1.0`
- Let `.github/workflows/release.yml` publish the versioned APK and checksum
- Include tested Android version and device notes
- Keep [docs/SECURITY-AUDIT.md](SECURITY-AUDIT.md) current when security-sensitive behavior changes

## Community Signals

- Keep at least a few starter issues open
- Keep issue labels accurate
- Keep the social preview image current
- Review `CODEOWNERS` when maintainership changes
