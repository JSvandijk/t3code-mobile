# Upstream Fit

This project is most credible to `pingdotgg/t3code` when it stays narrow and reliability-focused.

## Principles

- Keep the scope tight: mobile access to an existing T3 Code session, not a fork of the full product.
- Prefer reliability work over novelty work: clearer failure states, better diagnostics, safer defaults, and stronger smoke tests.
- Keep changes explainable: every meaningful UX or behavior change should map back to a real operator problem.
- Provide evidence: screenshots for UI changes, short videos for interaction-heavy changes, and repeatable smoke checks for infrastructure work.

## What This Repo Tries To Prove

- A mobile companion can be built without turning T3 Code into a different product.
- A browserless Android shell is a meaningful product difference from phone-in-browser access.
- WebView-based access can still be handled with disciplined security defaults and visible error handling.
- Small self-hosted tools benefit from observability too: copyable diagnostics in the app and a health endpoint in proxy mode make support and triage much faster.

## Current Validation

Last checked: 2026-05-05 on `main` after the ESLint 10 and Node runtime update in
[`JSvandijk/t3code-mobile#19`](https://github.com/JSvandijk/t3code-mobile/pull/19).

- `npm test` passes from a clean local checkout after `npm ci`.
- JavaScript syntax checks pass.
- ESLint 10 flat-config linting passes with no warnings.
- `manifest.json` validation passes.
- Release checks pass for version `1.1.0`.
- HTML unit tests pass: 18/18.
- Proxy smoke test passes, including HTML injection, static assets, and `GET /__t3mobile/health`.
- `cmd /c build-apk.bat` builds a dev-signed APK successfully.

The current upstream discussion is tracked in
[`pingdotgg/t3code#2514`](https://github.com/pingdotgg/t3code/issues/2514).

## Good Upstream-Friendly Change Shapes

- Small reliability fixes
- Safer defaults
- Better diagnostics
- Narrow performance improvements
- Documentation that reduces maintainer guesswork

## Change Shapes To Avoid

- Broad feature work that changes product direction
- Large UI rewrites without evidence
- Complex abstractions that hide straightforward behavior
- Any change that makes the app feel like a generic browser or remote-agent platform
