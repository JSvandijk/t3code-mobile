# Security Policy

## Scope

T3 Code Mobile is designed for self-hosted use over Tailscale or another trusted private network. Security reports are welcome, especially for issues involving:

- unsafe SSL handling
- token exposure
- WebView permission abuse
- proxy misconfiguration that could expose a local T3 instance

## Supported Versions

Only the latest state of the default branch is considered supported for security fixes.

## Reporting A Vulnerability

If GitHub private vulnerability reporting is enabled for the repository, use that first.

If private reporting is not available, do not post secrets, tokens, private URLs, or exploit details in a public issue. Instead:

1. Open a minimal public issue requesting a private security follow-up.
2. Include only enough information to confirm that the problem exists.
3. Wait before publishing proof-of-concept details.

## Security Notes For Users

- Treat this project as a companion for trusted networks, not as a hardened public internet gateway.
- Avoid exposing the proxy directly to the public internet.
- Use trusted certificates for HTTPS where possible.
- Review WebView and proxy settings carefully before broader deployment.
