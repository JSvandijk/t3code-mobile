# Security Audit

Audit date: April 21, 2026

This document records the current security posture of `t3code-mobile`, the fixes applied in this pass, and the residual risks that still exist by design.

## Scope

Reviewed components:

- Android WebView wrapper in `apk/app/src/main/java/com/t3code/app/MainActivity.java`
- Android manifest and network configuration
- Optional HTTPS/PWA proxy in `server.js`
- Current public repo and contributor setup

## Security Changes Applied

### 1. Invalid TLS certificates are now blocked

Previous behavior:

- the app called `handler.proceed()` on certificate errors

Current behavior:

- the app cancels invalid TLS loads and shows a blocking error state

Why this changed:

- Android's WebView documentation explicitly warns that apps should call `cancel()` rather than `proceed()` on SSL errors

### 2. WebView navigation is scoped to the configured server

Previous behavior:

- any HTTP or HTTPS navigation could stay inside the app

Current behavior:

- only the configured server host and port stay inside the WebView
- other links are opened through the external browser

Why this changed:

- it reduces the chance that the app becomes a generic browser surface for untrusted destinations

### 3. Web permissions are narrowed

Previous behavior:

- the app granted every `PermissionRequest` resource automatically

Current behavior:

- the app only grants microphone access
- Android runtime permission is requested before granting microphone access
- unrelated WebView permission requests are denied

### 4. Unnecessary WebView capabilities were reduced

Changes:

- removed `MIXED_CONTENT_ALWAYS_ALLOW`
- switched to `MIXED_CONTENT_NEVER_ALLOW` for HTTPS targets
- use `MIXED_CONTENT_COMPATIBILITY_MODE` only for HTTP targets
- disabled file URL access
- disabled popup auto-open behavior
- kept Safe Browsing enabled

## Dynamic Tests Performed

Tests run on April 21, 2026:

- `npm test`
- `build-apk.bat`
- APK install on Android emulator
- app launch in emulator
- first-run connect screen validation
- HTTP WebView harness load in emulator
- HTTPS invalid-certificate harness load in emulator

## Dynamic Test Results

### Confirmed

- the app builds and installs cleanly in the emulator
- the first-run connect flow renders correctly
- a local HTTP harness on `10.0.2.2:4888` loads inside the WebView
- the injected image-upload button appears in the composer area on the local harness page

### Still needs follow-up

- an invalid-HTTPS test against a local self-signed harness did not render a useful visible error card in the emulator
- the load was blocked in practice, but the observed UI state was a blank dark WebView instead of a clean explanatory failure screen

That means the TLS posture is materially safer than before, but the failure UX still needs work.

## Static Review Findings

### Fixed in this pass

1. Unsafe TLS bypass in the Android WebView
2. Overbroad WebView permission grants
3. Broad in-app navigation scope
4. Overly permissive mixed-content policy
5. Unnecessary file access inside WebView

### Still true by design

1. Cleartext HTTP is still allowed

Reason:

- the project is intentionally aimed at Tailscale and trusted LAN usage, where self-hosted HTTP is often the simplest path

Impact:

- this is acceptable on a trusted private network
- it is not appropriate as a claim of hardened public-internet transport security

2. The app injects JavaScript into the configured T3 UI

Reason:

- the image upload button depends on DOM injection into the upstream app

Impact:

- if you do not trust the configured T3 host, you should not trust the injected page either

3. No certificate pinning

Reason:

- the app targets self-hosted environments where certificates may change frequently

Impact:

- this is a practical tradeoff, but it means trust still depends on the normal platform trust store and network model

4. Optional proxy mode depends on operator discipline

Reason:

- the proxy can still be misconfigured if someone exposes it too broadly or uses weak TLS practices

Impact:

- the proxy should be treated as self-hosted infrastructure, not a turnkey hardened edge service

5. TLS failure UX still needs another pass

Reason:

- in emulator testing, an invalid certificate path produced a blocked/blank load instead of a polished visible error state

Impact:

- this is primarily a usability and trust problem, not a return to the previous silent TLS bypass
- it should still be fixed because security controls need clear user feedback

## Honest Security Position

What this repo can reasonably claim now:

- safer Android WebView defaults than before
- no automatic TLS bypass
- narrower permission grants
- narrower in-app navigation scope
- explicit documentation of remaining tradeoffs

What this repo should not claim:

- hardened public-internet deployment
- formal penetration-test certification
- complete elimination of self-hosted risk

## Recommended Next Security Steps

- add optional host allowlisting for more than one trusted origin if the product needs it
- add a lightweight security review to every release
- add emulator or device smoke tests for HTTP, HTTPS, and blocked certificate flows
- publish tested device and Android version notes in release descriptions

## References

- Android `SslErrorHandler`: https://developer.android.com/reference/android/webkit/SslErrorHandler
- Android `WebViewClient.onReceivedSslError`: https://developer.android.com/reference/android/webkit/WebViewClient.html
- Android `WebSettings` mixed-content constants: https://developer.android.com/reference/android/webkit/WebSettings.html
- Android `PermissionRequest`: https://developer.android.com/reference/android/webkit/PermissionRequest
- Android WebView native bridge guidance: https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges
- Android WebView management and Safe Browsing: https://developer.android.com/develop/ui/views/layout/webapps/managing-webview
