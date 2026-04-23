# CLAUDE.md — Automatic Context for Claude Code

This file is read automatically at the start of every Claude Code session.
It exists because conversation history does NOT persist between sessions.

## What This Repo Is

`t3code-mobile` is an unofficial Android and iPhone companion app + optional HTTPS/PWA proxy for T3 Code.
Three deliverables: native Android WebView wrapper (`apk/`), iPhone PWA via proxy (`IPHONE-GUIDE.md`), and HTTPS proxy (`server.js`).
Built by ChatGPT 5.4, reviewed by Claude Opus.

## Current State

- Branch: `main`
- Version: `1.1.0` (in `package.json`)
- GitHub: `https://github.com/JSvandijk/t3code-mobile`
- Owner: Jesse van Dijk (JSvandijk)

## Key Files (read these first in a new session)

1. `README.md` — public-facing overview
2. `docs/CHAT-CONTEXT.md` — operational handoff with rules and failure modes
3. `package.json` — scripts, deps, version
4. `server.js` — HTTPS/HTTP proxy (the main Node.js code, supports `--http` flag)
5. `IPHONE-GUIDE.md` — iPhone PWA setup guide (from scratch)
6. `apk/app/src/main/java/com/t3code/app/MainActivity.java` — Android app (single activity)
7. `sw.js` — service worker
8. `webview-harness.js` — local test harness
9. `smoke-proxy.js` — proxy smoke test
10. `check-release.js` — release validation

## Useful Commands

```bash
npm test                          # full test suite (syntax + lint + manifest + repo checks + unit tests + proxy smoke)
npm run test:units                # unit tests only (lib/html.js)
npm run harness:http              # local WebView test server (HTTP)
npm run harness:https-bad-cert    # local WebView test server (bad cert)
npm run harness:redirect          # local WebView test server (redirect)
npm run start:iphone              # PWA proxy in HTTP mode for iPhone
```

Windows APK build: `build-apk.bat`
iPhone PWA: `npm run start:iphone` + `tailscale serve https / http://localhost:3780`

## Working Rules

- GitHub is the real end state. Work is not done until committed and pushed.
- Do not treat documentation as proof. Prefer executable checks and runtime evidence.
- Always do an adversarial pass after implementation (info disclosure, escaping, overbroad config, deprecated APIs).
- Read code, docs, and audits against each other. Mismatches are bugs.
- Remove dead code. Do not let old and new implementations coexist without explanation.
- Evidence must match the exact commit being represented.
- A self-audit can miss issues introduced by the same authoring pass. Be explicit about this limitation.

## Known Failure Modes (from prior sessions)

- Same-pass contradiction: code, docs, and self-audit all wrong together
- Documentation-as-proof fallacy: strong README != strong tests
- Add-more-than-delete bias: dead files remain across iterations
- Evidence drift: evidence from one SHA misrepresented for a later SHA
- Security theater: document exists but code doesn't implement it

## Context About This Project

This project was built primarily by ChatGPT 5.4 and reviewed by Claude Opus.
The owner (Jesse) uses this as a comparative evaluation of AI code quality.
Be honest, strict, and accurate in all assessments.

@AGENTS.md
