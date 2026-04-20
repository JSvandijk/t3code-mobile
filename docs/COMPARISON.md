# Project Comparison

This comparison is based on the public README and repository pages available on April 21, 2026.

## At A Glance

| Project | Main focus | Mobile story | How it compares to this repo |
| --- | --- | --- | --- |
| [`pingdotgg/t3code`](https://github.com/pingdotgg/t3code) | Official T3 Code app and upstream product | Desktop app plus broader agent GUI | This is the direct inspiration and the upstream product. Your repo is a lightweight mobile companion around that experience, not a replacement. |
| [`kzahel/yepanywhere`](https://github.com/kzahel/yepanywhere) | Remote UI for Claude Code and Codex | Strong mobile-first UX, file uploads, notifications, remote access | Broader and more feature-rich. Better if someone wants a full remote control surface, not just a T3-specific phone wrapper. |
| [`saadnvd1/agent-os`](https://github.com/saadnvd1/agent-os) | Mobile-first AI coding session manager | Mobile access, Tailscale guidance, multi-pane tooling | Much heavier and more operations-oriented. Good reference for documentation quality and deployment clarity. |
| [`siteboon/claudecodeui`](https://github.com/siteboon/claudecodeui) | Web/mobile UI plus managed cloud option | Web, mobile app, API, IDE access | Wider scope and multi-product positioning. Useful as a reference for public-facing GitHub structure, not for keeping this project intentionally small. |

## Positioning For `t3code-mobile`

Use this repository if you want:

- A narrow T3 Code companion app instead of a new agent platform
- A simple Android wrapper around your own running T3 Code instance
- Tailscale-friendly mobile access with very little setup overhead
- A persistent photo upload shortcut inside the existing T3 Code UI

Use one of the broader projects above if you want:

- Push notifications
- Multi-session dashboards
- Remote approvals
- Multi-provider orchestration
- A more fully featured web control plane

## What Makes This Repo Worth Sharing

- It solves a concrete mobile use case with minimal moving parts
- It is understandable in a few files
- It is easy for another T3 user to adapt to their own network
- It complements the upstream T3 Code project instead of competing with it

## Recommended Public Framing

If you publish this repo, the clearest positioning is:

> An unofficial Android companion for T3 Code, focused on lightweight mobile access and inline photo upload support.

That framing is accurate, respectful to the upstream project, and easy for T3 admins or maintainers to evaluate quickly.
