# Runtime Evidence Set: v1.1.0 Emulator

This folder captures a reproducible emulator-backed evidence set for the `t3code-mobile` runtime on the current `v1.1.0` code.

## Scope

This evidence set proves:

- the first-run connect screen renders on Android
- the app can run diagnostics against a reachable HTTP target
- a full pairing-style link can be entered and normalized down to the base URL
- the HTTP warning appears before a cleartext session starts
- the app reaches the configured HTTP target and renders the in-app shell
- invalid HTTPS certificates are blocked with an explicit native error state

This evidence set does not prove:

- behavior on a physical Android device
- microphone permission flow
- real T3 Code upstream behavior beyond the local harness and existing repo smoke tests
- upload-button behavior by machine-readable assertion

## Environment

See [environment.txt](environment.txt).

At capture time this set used:

- emulator / AVD: `Medium_Phone_API_36.1`
- Android release: `16`
- Android SDK: `36`
- WebView package: `com.google.android.webview 145.0.7632.79`
- app package: `com.t3code.app`
- app version: `1.1.0`

## Automated Checks

- Full repo checks: [automated-checks.txt](automated-checks.txt)
- Expected gate: `npm test`

These checks passed for this evidence set.

## Captured Artifacts

### 1. First-run connect screen

- Screenshot: [connect-screen.png](connect-screen.png)

This proves the clean first-run state on Android after fresh app data.

### 2. Diagnostics path on Android

- Screenshot: [diagnostics-report-http.png](diagnostics-report-http.png)
- UI dump: [diagnostics-report-http.xml](diagnostics-report-http.xml)
- Extracted snippet: [diagnostics-report-http-snippet.txt](diagnostics-report-http-snippet.txt)

Key excerpt:

```text
Base URL: http://10.0.2.2:4888
Target probe
URL: http://10.0.2.2:4888
HTTP status: 200
```

Interpretation:

- the Android diagnostics dialog rendered correctly
- the app could reach the HTTP harness over the emulator loopback path
- the diagnostics code reported the expected target URL and transport details

Note:

The `Proxy health probe` line here is only evidence that the diagnostics path executed against the harness target. It is not standalone proof of the real proxy health endpoint semantics. That proof remains covered by [automated-checks.txt](automated-checks.txt) and `smoke-proxy.js`.

### 3. Full pairing-link input accepted

- Screenshot: [pair-link-input.png](pair-link-input.png)
- UI dump: [pair-link-input.xml](pair-link-input.xml)

The input dump contains:

```text
http://10.0.2.2:4888/pair#token=demo-token
```

This proves the Android UI accepted a full pairing-style URL, not just a bare base URL.

### 4. Cleartext warning before HTTP session

- Screenshot: [cleartext-warning.png](cleartext-warning.png)
- UI dump: [cleartext-warning.xml](cleartext-warning.xml)

This proves the app showed the native HTTP warning before continuing to a cleartext session.

### 5. In-app HTTP session after continue

- Screenshot: [after-connect-http.png](after-connect-http.png)
- UI dump: [after-connect-http.xml](after-connect-http.xml)
- Menu capture: [menu-open.png](menu-open.png)
- Menu dump: [menu-open.xml](menu-open.xml)

This proves the app continued into the in-app shell and exposed the native `MENU` control on top of the WebView.

Visual review is still required for any screenshot-only claims about layout or upload-button placement.

### 6. Base URL normalization confirmed

- Screenshot: [connection-info.png](connection-info.png)
- UI dump: [connection-info.xml](connection-info.xml)
- Extracted snippet: [connection-info-snippet.txt](connection-info-snippet.txt)

Key excerpt:

```text
Base URL: http://10.0.2.2:4888
Last page: http://10.0.2.2:4888/
```

Interpretation:

- the app was launched from a full pairing-style URL
- the stored / active app connection info shows only the normalized base URL
- the token fragment is not retained in the in-app connection info

### 7. Invalid HTTPS is blocked

- Screenshot: [invalid-https-blocked.png](invalid-https-blocked.png)
- UI dump: [invalid-https-blocked.xml](invalid-https-blocked.xml)
- Extracted snippet: [invalid-https-snippet.txt](invalid-https-snippet.txt)

Key excerpt:

```text
Certificate warning
The server certificate could not be verified for 10.0.2.2.
The app blocks invalid certificates.
```

Interpretation:

- the app did not proceed past a self-signed / untrusted certificate
- the failure mode is explicit and user-readable
- the overlay still exposes retry and diagnostics actions

## Commit Applicability

This evidence set was captured against commit `7b7680807bd97f06802fd98783096dd37223b673`. If commits after that SHA changed runtime-affecting code, this evidence does not cover the newer changes. Commits that only change documentation, CI, or repo metadata do not invalidate this set.

## Status Summary

- Proven by emulator runtime evidence: connect screen, diagnostics path, pairing-link input acceptance, cleartext warning, base URL normalization, invalid HTTPS blocking
- Proven by automated checks: manifest integrity, release gates, proxy smoke path, proxy header expectations
- Still not proven here: physical-device behavior, microphone permission path, and machine-verifiable upload-button assertion
