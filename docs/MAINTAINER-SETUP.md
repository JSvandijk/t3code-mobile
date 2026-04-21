# Maintainer Setup

Use this checklist to keep the public repository configuration aligned with the files in this repo.

## GitHub Settings

- Default branch: `main`
- Branch protection on `main`
  - require status checks: `node-checks`
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
- Upload the APK as a GitHub Release asset
- Include tested Android version and device notes
- Keep [docs/SECURITY-AUDIT.md](SECURITY-AUDIT.md) current when security-sensitive behavior changes

## Community Signals

- Keep at least a few starter issues open
- Keep issue labels accurate
- Keep the social preview image current
- Review `CODEOWNERS` when maintainership changes
