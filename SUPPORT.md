# Support

Use GitHub Issues for bugs and feature requests.

Before opening an issue:

- read the [README.md](README.md)
- read the [INSTALLATION-GUIDE.md](INSTALLATION-GUIDE.md)
- check whether the same problem is already reported

## Include This In Bug Reports

- Android device model
- Android version
- T3 Code version if known
- whether you used Tailscale, LAN, or the HTTPS proxy
- the exact base URL format you used
- steps to reproduce
- screenshots if the UI is involved

## Best Support Path

- Bug in the Android wrapper: open a bug report
- Improvement idea: open a feature request
- Security-sensitive issue: follow [SECURITY.md](SECURITY.md)

## Quick Troubleshooting

- Pairing link confusion: paste the full link if you want, but the app saves only the base URL
- Tailscale hostname issues: confirm both devices are in the same Tailnet and the hostname still resolves from your phone
- Proxy certificate warnings: verify `PUBLIC_URL` matches the address you open and that the certificate is trusted by the device
- Missing upload button: reload once, switch chats once, then include a screenshot if the button still does not appear

Please keep private IPs, tokens, and certificates out of public issues.
