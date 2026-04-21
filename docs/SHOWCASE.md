# Showcase Notes

Use this document when you want to explain why this repository is worth attention on GitHub, in release notes, or in an upstream discussion.

## One-Sentence Pitch

`t3code-mobile` turns an existing self-hosted T3 Code session into a phone-friendly experience with no browser chrome, faster setup, inline image upload support, and clearer failure diagnostics.

## Why This Repo Is Worth Looking At

- It solves a real pain point for T3 users who want fast phone access without a generic browser UI.
- It stays narrow and respectful to the upstream product instead of pretending to replace it.
- It includes reliability work, not just UI polish: diagnostics, scoped navigation, smoke tests, and health checks.
- It shows deliberate product thinking: accept a full pairing link for convenience, but only keep the safe base URL.
- It is small enough for contributors to understand without spending days reverse-engineering the codebase.

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

### Connect Screen

![T3 Code Mobile connect screen](images/connect-screen.png)

Shows the browserless Android entry point and the narrow scope of the app.

### Pairing-Link Input

![T3 Code Mobile pairing-link input](images/pair-link-input.png)

Shows that a full pairing link can be pasted while the app keeps only the base URL.

### Composer Upload Shortcut

![T3 Code Mobile composer with upload button](images/composer-upload.png)

Shows the in-app photo upload action living inside the T3 composer flow.

### Local Upload Harness

![T3 Code Mobile local test harness](images/test-harness.png)

Shows the local harness used to validate upload-button injection and paste behavior without depending on the upstream app being available during every test.

## Recommended Public Framing

If you need a short public summary, use this:

> An unofficial Android companion for T3 Code that focuses on browserless mobile access, inline image upload support, and practical self-hosted reliability work.

## What Still Makes The Repo More Credible

- More real-device screenshots across Android versions
- A short demo video of connect, pair, and upload
- Runtime smoke coverage for HTTP, HTTPS, and blocked certificate flows
- A few public issues that point contributors at reliability work instead of random feature churn
