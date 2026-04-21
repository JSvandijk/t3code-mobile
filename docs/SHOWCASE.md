# Showcase Notes

Use this document when you want to explain why this repository is worth attention on GitHub, in release notes, or in an upstream discussion.

## One-Sentence Pitch

`t3code-mobile` turns an existing self-hosted T3 Code session into a lightweight, browserless phone experience with faster setup, inline image upload support, and clearer failure diagnostics.

## Why This Repo Is Worth Looking At

- It solves a real pain point for T3 users who want fast phone access without a generic browser UI.
- It stays narrow and respectful to the upstream product instead of pretending to replace it.
- It includes reliability work, not just UI polish: diagnostics, scoped navigation, smoke tests, and health checks.
- It shows deliberate product thinking: accept a full pairing link for convenience, but only keep the safe base URL.
- It is small enough for contributors to understand without spending days reverse-engineering the codebase.
- It has a clear taste-level opinion: on mobile, lightweight and dependable beats broader but more fragile product sprawl.

## What Publicly Attractive Repos Usually Get Right

Repositories that collect attention tend to do a few simple things well above the fold:

- They explain the product in one sentence without making readers reverse-engineer the scope.
- They show real screenshots early, so visitors can see the product before they read deep docs.
- They prove a concrete user benefit instead of leading with implementation details.
- They make installation or evaluation look fast, even if the underlying engineering is not trivial.
- They feel opinionated and narrow, which makes the repo easier to trust.

For `t3code-mobile`, that means the homepage should emphasize three things immediately:

- browserless in-app T3 usage on Android
- a lightweight mobile workflow instead of a heavy dashboard
- native phone behavior such as photo upload inside the T3 session

## Hard Engineering Work Already In The Repo

- Full pairing-link parsing so users can paste what T3 gives them without manual cleanup.
- WebView host scoping so the app behaves like a companion surface instead of a free browser shell.
- Reinjected upload controls that survive T3's SPA navigation and DOM churn.
- Copyable in-app diagnostics for HTTP, SSL, and network failures.
- Optional HTTPS/PWA proxy injection with an explicit health endpoint and a proxy smoke test.
- Portable local WebView harness commands for HTTP, invalid-HTTPS, and redirect regression checks.
- Windows-friendly release flow that keeps APK versioning aligned with `package.json`.

## Evidence That Should Be Visible Publicly

- A README with product screenshots and a clear explanation of scope.
- A release page with a versioned APK and checksum.
- A smoke-tested proxy path that proves the web mode is not just theoretical.
- Screenshots that show both user-facing UX and engineering evidence.
- A documented harness path that contributors can run locally instead of relying on private maintainer setup.
- Honest notes about limitations, especially around Android runtime coverage and upstream DOM coupling.

## Current Screenshot Set

### Browserless In-Chat View

![T3 Code Mobile browserless in-chat view](images/browserless-chat.jpg)

Shows the core claim directly: T3 is usable from a phone inside a focused app shell rather than a generic mobile browser tab.

### Mobile Project And Chat List

![T3 Code Mobile project and chat list](images/mobile-project-list.jpg)

Shows a lightweight project workflow that still feels readable and practical on a phone-sized screen.

### Native Android Photo Picker

![T3 Code Mobile native Android photo picker](images/native-photo-picker.jpg)

Shows that uploads happen through native Android UI without breaking the in-app T3 flow.

## Recommended Public Framing

If you need a short public summary, use this:

> An unofficial Android companion for T3 Code that focuses on browserless mobile access, inline image upload support, and practical self-hosted reliability work.

## What Still Makes The Repo More Credible

- More real-device screenshots across Android versions
- A short demo video of connect, pair, and upload
- Runtime smoke coverage for HTTP, HTTPS, and blocked certificate flows
- A few public issues that point contributors at reliability work instead of random feature churn
