# Chat Context Handoff

This file exists so a new chat or contributor can recover the important project context quickly from the repository itself instead of relying on prior conversation history.

## Current Repo State

- Repository: `JSvandijk/t3code-mobile`
- Default branch: `main`
- Current public version in `package.json`: `1.1.0`
- Verified on April 21, 2026: local `main` and `origin/main` were brought back to the same commit and the worktree was clean.
- Current synced `HEAD`: `9104962a1cad351d3f0f2028eb9682aba4fc6870`
- Required GitHub checks on that commit were green on April 21, 2026: `node-checks` and `android-build`

## What Changed In The Latest Cleanup

- The repo was resynced so local `main` and GitHub `origin/main` matched again.
- This handoff file was added so future chats have a stable starting point from the repo itself.
- `README.md` was updated to point new chats and maintainers to this file first.
- This handoff was refined so an external reviewer such as Opus can read the repo state without prior chat history.

## What This Repo Is

`t3code-mobile` is a narrow companion project for using an existing T3 Code session from Android with as little friction as possible.

The repo contains two main deliverables:

- A native Android WebView wrapper in `apk/`
- An optional HTTPS/PWA proxy in `server.js`

The project is intentionally small, browserless, and reliability-first. It is not meant to become a broad remote-agent dashboard.

## Files A New Chat Should Read First

Read these in this order:

1. `README.md`
2. `docs/CHAT-CONTEXT.md`
3. `package.json`
4. `apk/app/src/main/java/com/t3code/app/MainActivity.java`
5. `server.js`
6. `webview-harness.js`

Then use these as needed:

- `INSTALLATION-GUIDE.md`
- `docs/WEBVIEW-HARNESS.md`
- `docs/SECURITY-AUDIT.md`
- `docs/PUBLISHING-CHECKLIST.md`
- `docs/MAINTAINER-SETUP.md`

## Important Behavior And Scope

- Full pairing links may be pasted, but only the base URL should be stored.
- The Android WebView stays scoped to the configured T3 host.
- Invalid TLS certificates should not be accepted.
- Cleartext HTTP is still supported for trusted private-network use cases, but it is a deliberate tradeoff.
- The inline image upload button is expected to survive SPA navigation.
- The proxy adds PWA assets, HTML injection, and `GET /__t3mobile/health`.

## Project-Specific Working Rules

These are not soft preferences. Treat them as operating rules for future chats working on this repo.

- GitHub is the real end state. Work is not considered done until relevant changes are committed and pushed when the goal is GitHub-facing.
- Do not treat documentation as proof. Prefer executable checks, runtime evidence, and direct verification over process documents.
- Always do a clone-from-scratch mindset pass before calling work finished. Check tracked files, `.gitignore`, runtime file paths, and whether scripts depend on local-only or generated files.
- Always do an adversarial pass after implementation. Look specifically for info disclosure, escaping failures, overbroad configuration, unsafe caching, unbounded buffering, and evidence mismatches.
- Read code, docs, release notes, and audits against each other. If they disagree, the mismatch is a bug.
- Remove or explain legacy files, dead code, deprecated platform patterns, and temporary paths. Do not let newer implementations coexist with stale older ones without a reason.
- For security-sensitive changes, explicitly assume that a self-audit can miss issues introduced by the same authoring pass. Prefer external review or stronger verification when possible.
- For release or evidence work, verify that the evidence matches the exact commit or tag being represented.

## Known Failure Modes To Guard Against

These are recurring failure patterns already seen on this project. Future chats should actively defend against them instead of treating them as abstract advice.

- Same-pass contradiction: code, docs, and self-audit can all agree with each other while still being wrong. Treat self-authored audits as limited and try to falsify them.
- Documentation-as-proof: a strong README, runbook, checklist, or evidence template does not prove runtime quality. Prefer runnable tests and direct verification.
- Add-more-than-delete bias: the repo can look polished while still carrying dead files, stale paths, deprecated APIs, or unused legacy implementations.
- Dirty-worktree blindness: do not assume local success means a clean clone works. Check tracked files, `.gitignore`, and runtime dependencies from a stranger's perspective.
- Security theater risk: if a security document exists, verify the code actually upholds it and call out the limits of a self-audit explicitly.
- Evidence drift: evidence captured for one SHA must not be casually described as proof for a later SHA unless the later commits are clearly non-runtime.
- GitHub-first discipline: if the goal is public GitHub quality, local-only changes and local-only conclusions are incomplete work.

## Useful Commands

```bash
npm test
npm run harness:http
npm run harness:https-bad-cert
npm run harness:redirect
```

On Windows, build the APK with:

```bat
build-apk.bat
```

## For A New Chat Session

A new chat cannot read old conversation history automatically. It can only read what is in the workspace unless you restate context.

This file is an operational handoff, not a full transcript of prior discussions. It captures current repo state, scope, and where to read next.

Use a prompt like this:

```text
Read README.md and docs/CHAT-CONTEXT.md first. Then inspect package.json, server.js, webview-harness.js, and apk/app/src/main/java/com/t3code/app/MainActivity.java. Treat docs/CHAT-CONTEXT.md as the current handoff and continue from there.
```

If the task is specifically about releases, publishing, or repo hygiene, also tell the new chat to read:

```text
docs/PUBLISHING-CHECKLIST.md and docs/MAINTAINER-SETUP.md
```

## For External Model Review

If another model such as Opus is reviewing this repo, it should assume the repo state below unless the working tree shows otherwise:

- local `main` and GitHub `origin/main` were synced
- the latest documented synced commit in this handoff was `9104962a1cad351d3f0f2028eb9682aba4fc6870`
- the required GitHub checks for that synced state were green
- prior conversation history is not available and should not be assumed

Use a review prompt like this:

```text
Read README.md and docs/CHAT-CONTEXT.md first. Treat docs/CHAT-CONTEXT.md as the authoritative handoff. Then inspect package.json, server.js, webview-harness.js, and apk/app/src/main/java/com/t3code/app/MainActivity.java. Review the repo radically honestly for bugs, risks, regressions, unclear docs, release hygiene problems, and mismatches between stated behavior and implementation. Do not assume you have prior chat history; rely only on the repository state and the handoff.
```

## Maintenance Rule

When major behavior, release process, or repo status changes, update this file in the same commit so future chats inherit current context from GitHub and the local checkout.
