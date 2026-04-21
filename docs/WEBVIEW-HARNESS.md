# WebView Harness

This repo includes a local harness for contributor testing of the Android WebView wrapper without depending on a live T3 Code session.

## Why It Exists

- It makes upload-button regressions easier to reproduce locally.
- It gives contributors a stable page structure for Android emulator tests.
- It provides a repeatable path for HTTP, invalid-HTTPS, and redirect scenarios.
- It creates portfolio-grade evidence that the project includes real reliability tooling, not just screenshots.

## Commands

Run these from the repo root:

```bash
npm run harness:http
npm run harness:https-bad-cert
npm run harness:redirect
```

Default ports:

- `4888` for the HTTP harness
- `4889` for the invalid-HTTPS harness

For the Android emulator, open:

- `http://10.0.2.2:4888/`
- `https://10.0.2.2:4889/`

The redirect harness returns an HTTP `302` to `https://10.0.2.2:4889/` by default.

For screenshot-friendly English demo pages, also open:

- `http://10.0.2.2:4888/demo/workspace`
- `http://10.0.2.2:4888/demo/projects`

## What To Test

### HTTP Harness

Use `npm run harness:http` to confirm:

- the WebView loads a trusted private-network HTTP page
- the injected image button appears next to the composer controls
- the paste-based upload flow fires on the harness page

### Invalid HTTPS Harness

Use `npm run harness:https-bad-cert` to confirm:

- the app blocks the self-signed certificate
- the app shows a clear error state instead of a silent or confusing failure

### Redirect Harness

Use `npm run harness:redirect` to confirm:

- the app handles an HTTP-to-HTTPS redirect predictably
- the invalid certificate still blocks the redirected load

## Notes

- The harness can use local `cert.pem` and `key.pem` files for the invalid-HTTPS path when they exist.
- If those files are absent, the harness generates a temporary self-signed certificate automatically.
- Override paths with `SSL_KEY_PATH` and `SSL_CERT_PATH` if needed.
- The harness also exposes `/status` for quick local checks.
- Pair this guide with [RUNTIME-VERIFICATION.md](RUNTIME-VERIFICATION.md) when you are collecting release evidence.

## Recommended Evidence To Capture

- a clean connect-screen screenshot
- a composer screenshot with the injected upload button visible
- an English demo-workspace screenshot from `/demo/workspace`
- an English project-list screenshot from `/demo/projects`
- a certificate-blocking screenshot if the HTTPS error UI changes
- device and Android version notes for any manual runtime verification
