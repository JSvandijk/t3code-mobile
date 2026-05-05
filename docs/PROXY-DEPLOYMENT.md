# Proxy Deployment Checklist

Use the optional proxy as self-hosted infrastructure for a T3 Code session you already control. It is not a hardened public edge service.

## Appropriate Use

- Use it on Tailscale, a trusted LAN, or behind a reverse proxy you already operate.
- Prefer HTTPS with a certificate trusted by the client device.
- Use `PROXY_HTTP=true` only behind Tailscale Serve or another HTTPS-terminating private reverse proxy.
- Keep `T3_TARGET` pointed at a T3 Code instance on a private host or loopback address.
- Keep `GET /__t3mobile/health` available for smoke tests and support checks.

## Do Not Use It This Way

- Do not expose the proxy directly to the public internet as an unauthenticated gateway.
- Do not use self-signed certificates on networks you do not control.
- Do not point `T3_TARGET` at an untrusted upstream host.
- Do not publish `.env` files, TLS keys, certificates, signed APKs, or local diagnostic output.
- Do not describe the proxy as production-hardened public infrastructure.

## Minimum Setup

1. Set `T3_TARGET` to your local T3 Code URL, for example `http://127.0.0.1:3773`.
2. Set `PUBLIC_URL` to the URL your phone will open.
3. For built-in HTTPS mode, set `SSL_KEY_PATH` and `SSL_CERT_PATH` to trusted certificate files.
4. For HTTP mode behind another HTTPS layer, set `PROXY_HTTP=true` and keep the HTTP listener private.
5. Run `npm test` before sharing setup instructions or publishing a release.

## Verification

Run the automated proxy smoke test:

```bash
npm run test:proxy
```

Then verify the deployed proxy from the phone network path:

- `GET /__t3mobile/health` returns JSON and does not expose filesystem paths.
- The reported upstream status is healthy.
- The root page loads through the expected HTTPS or trusted private-network path.
- Browser dev tools or proxy logs do not show TLS key paths, tokens, or private filesystem paths.

If any of those checks fail, treat the deployment as not verified.
