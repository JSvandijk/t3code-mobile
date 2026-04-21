# Project Comparison

This comparison is based on the public README and repository pages available on April 21, 2026.

The goal here is not to claim that `t3code-mobile` is broadly "better" than every other project. The goal is to be precise about where it is genuinely differentiated and why that narrower shape is valuable.

## At A Glance

| Project | Main focus | Mobile story | How it compares to this repo |
| --- | --- | --- | --- |
| [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) | Official T3 Code app and upstream product | Desktop app plus broader agent GUI | This is the direct inspiration and the upstream product. This repo is a lightweight mobile companion around that experience, not a replacement. |
| [`kzahel/yepanywhere`](https://github.com/kzahel/yepanywhere) | Remote UI for Claude Code and Codex | Strong mobile-first browser UI with uploads, notifications, remote access, and device streaming | Much broader. Based on its public docs, you open it in a browser and it aims to be a full remote control surface. `t3code-mobile` is narrower and, on Android, more browserless. |
| [`saadnvd1/agent-os`](https://github.com/saadnvd1/agent-os) | Mobile-first AI coding session manager | Mobile web UI with multi-pane terminals, code search, Git integration, and orchestration | More like a mobile operations console. Strong if you want many agent workflows; heavier than a slim T3 companion. |
| [`siteboon/claudecodeui`](https://github.com/siteboon/claudecodeui) | Web/mobile UI plus managed cloud option | Browser-based UI on phone with cloud and multi-agent support | Broader platform story, more settings, more product surface. Useful as a reference for repo maturity, but not for staying intentionally lightweight. |

## Where `t3code-mobile` Is Actually Different

The clearest differentiator, based on the public docs above plus this repo's implementation, is:

- `t3code-mobile` is the only repo in this comparison set that is explicitly optimized for a browserless Android wrapper around T3 Code itself.
- The browser-first projects tell users to open `localhost` or `[yourip]:port` in a browser on their phone.
- This repo instead wraps the session in a native fullscreen WebView, scopes navigation to the configured T3 server, and avoids mobile browser chrome entirely.

That does not make it "better" on every axis. It does make it a stronger fit for one exact use case: quick, low-friction T3 access from a phone without the feeling of managing yet another web dashboard.

## Positioning For `t3code-mobile`

Use this repository if you want:

- A narrow T3 Code companion app instead of a new agent platform
- A native-feeling Android shell with no visible browser URL bar or browser controls
- Tailscale-friendly mobile access with very little setup overhead
- A persistent photo upload shortcut inside the existing T3 Code UI
- Lightweight reliability work such as diagnostics, health checks, and latency reporting instead of a broad control plane

Use one of the broader projects above if you want:

- Push notifications
- Multi-session dashboards
- Remote approvals
- Multi-provider orchestration
- A more fully featured web control plane

## Lightweight Improvements That Strengthen This Repo

The strongest next steps are the ones that make the mobile experience feel faster and more reliable without turning the project into a larger platform:

- Better screenshots of the real T3 workspace on Android, because the browserless fullscreen experience is a major differentiator
- Stronger Android runtime verification on real devices, especially around SSL failure states and reconnect behavior
- More narrow proxy reliability work: upstream timeout tuning, latency reporting, and cleaner failure screens
- More resilient DOM targeting for the inline upload button as upstream T3 UI changes over time

Those changes reinforce the current identity of the repo. They improve trust and mobile usability without adding dashboards, accounts, databases, or platform sprawl.

## What Makes This Repo Worth Sharing

- It solves a concrete mobile use case with minimal moving parts
- It is understandable in a few files
- It is easy for another T3 user to adapt to their own network
- It preserves a native-feeling mobile presentation instead of exposing a browser tab full of chrome
- It complements the upstream T3 Code project instead of competing with it

## Recommended Public Framing

If you publish this repo, the clearest positioning is:

> An unofficial Android companion for T3 Code, focused on lightweight browserless mobile access, inline photo upload support, and practical self-hosted reliability work.

That framing is accurate, respectful to the upstream project, and easy for T3 admins or maintainers to evaluate quickly.

## Sources

- [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code)
- [`kzahel/yepanywhere`](https://github.com/kzahel/yepanywhere)
- [`saadnvd1/agent-os`](https://github.com/saadnvd1/agent-os)
- [`siteboon/claudecodeui`](https://github.com/siteboon/claudecodeui)
