# Contributing

Thanks for considering a contribution to T3 Code Mobile.

The project is intentionally small. That is an advantage. Good contributions here are usually focused, practical, and easy to review.

## Best Ways To Help

- Report reproducible bugs with device and network details
- Improve onboarding and troubleshooting docs
- Harden the Android WebView behavior
- Improve the composer image upload integration
- Improve release automation and CI

## Before You Start

1. Read the [README.md](README.md) to understand the project scope.
2. Read the [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md) if your work affects setup.
3. Check [ROADMAP.md](ROADMAP.md) for the current priorities.
4. If you want to work on something larger, open an issue first so the direction is clear.

## Development Setup

### Android app

- Windows
- Android SDK with `build-tools 36.1.0`
- Android platform `android-35`
- JDK 11+

Build the APK:

```bat
build-apk.bat
```

### Optional proxy

```bash
npm install
npm test
npm start
```

## Contribution Guidelines

- Keep pull requests narrowly scoped.
- Prefer small fixes over broad refactors.
- Preserve the project's lightweight approach.
- Update docs when behavior changes.
- Do not commit secrets, certificates, private IPs, or pairing tokens.

## Pull Request Checklist

- The change solves one clear problem
- The README or docs were updated if needed
- `npm test` passes
- Manual testing was done for any user-facing behavior
- The PR description explains what changed and how it was tested

## Good First Issues

Issues labeled `good first issue` should be suitable for a new contributor.

Issues labeled `help wanted` are useful places for deeper help, even if they are not beginner-sized.

If no such issues exist yet and you want to contribute, open an issue describing the improvement you want to make before starting large work.

## Communication

- Use issue templates for bugs and feature ideas
- Keep bug reports concrete and reproducible
- If a change affects security, follow [SECURITY.md](SECURITY.md)

## Project Direction

This repository is an unofficial T3 Code companion, not a general-purpose remote agent platform. Contributions that improve mobile access, reliability, onboarding, and maintainability are the best fit.
