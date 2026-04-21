# Starter Issues

These are ready-to-open issue ideas that make the repo feel alive, intentional, and contributor-friendly.

## 1. Add physical-device runtime evidence for v1.1.x

Why it matters:

- closes the biggest remaining evidence gap
- strengthens release credibility immediately

Suggested scope:

- capture a real Android device evidence set using `docs/evidence/DEVICE-CAPTURE-CHECKLIST.md`
- include device model, Android version, and WebView version
- link the result from the next release notes

Labels:

- `docs`
- `help wanted`

## 2. Add automated assertion coverage for the upload-button path

Why it matters:

- the upload flow is one of the core product claims
- it is still stronger visually than it is mechanically asserted

Suggested scope:

- expand the local harness or verification flow so the injected control can be asserted more directly
- document what is and is not guaranteed by the automated check

Labels:

- `android`
- `help wanted`

## 3. Harden DOM targeting for composer upload injection

Why it matters:

- upstream UI drift is a realistic long-term risk
- this is a good contributor-sized reliability issue

Suggested scope:

- review the current selector strategy in `MainActivity.java`
- reduce brittle assumptions where possible
- keep fallback placement behavior documented

Labels:

- `android`
- `good first issue`

## 4. Add a release demo clip for the README and release page

Why it matters:

- the repo is now engineering-credible
- the next unlock is shareability and fast comprehension

Suggested scope:

- record a short clip covering connect, pair, chat, upload, and cert-blocking
- export a GitHub-friendly asset and link it from the next release

Labels:

- `community`
- `docs`

## 5. Improve proxy deployment guidance for self-hosted users

Why it matters:

- the proxy is useful but easy to misunderstand
- better deployment guidance lowers support overhead

Suggested scope:

- expand docs around trusted-network assumptions
- add a short “when not to expose this” checklist
- keep the guidance aligned with `SECURITY.md`

Labels:

- `proxy`
- `docs`
