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

## 2. Harden DOM targeting for composer upload injection

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

## 3. Add iPhone PWA runtime evidence

Why it matters:

- the PWA path has automated proxy coverage but still needs real-device proof
- iOS-specific install and safe-area behavior should be checked on hardware

Suggested scope:

- install the PWA on a real iPhone or iPad
- capture connection, launch-from-home-screen, and proxy health evidence
- update `IPHONE-GUIDE.md` if device behavior differs from the current notes

Labels:

- `docs`
- `help wanted`

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

## 5. Add release signing verification notes

Why it matters:

- Android update trust depends on stable signing identity
- signing continuity is the highest-risk release operations gap

Suggested scope:

- document the intended public release signing fingerprint
- add a release-time manual verification step for signer continuity
- keep private signing material out of the repo

Labels:

- `android`
- `security`
