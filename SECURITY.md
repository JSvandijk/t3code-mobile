# Security Policy

## Scope

T3 Code Mobile is designed for self-hosted use over Tailscale or another trusted private network. Security reports are welcome, especially for issues involving:

- unsafe SSL handling
- token exposure
- WebView permission abuse
- proxy misconfiguration that could expose a local T3 instance

Current audit notes and mitigations are tracked in [docs/SECURITY-AUDIT.md](docs/SECURITY-AUDIT.md).

## Supported Versions

Only the latest state of the default branch is considered supported for security fixes.

## Reporting A Vulnerability

GitHub private vulnerability reporting should be enabled for this repository and is the preferred path for sensitive reports.

If private vulnerability reporting is unavailable for some reason, do not post secrets, tokens, private URLs, or exploit details in a public issue. Open a minimal issue requesting a private follow-up and wait before sharing proof-of-concept details.

Target response windows:

- initial maintainer acknowledgement within 7 days
- status update within 14 days when the issue is reproducible

## Security Notes For Users

- Treat this project as a companion for trusted networks, not as a hardened public internet gateway.
- Avoid exposing the proxy directly to the public internet.
- Use trusted certificates for HTTPS where possible.
- Review WebView and proxy settings carefully before broader deployment.
