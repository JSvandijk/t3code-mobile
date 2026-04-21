# Chat Context Handoff

This file exists so a new chat or contributor can recover the important project context quickly from the repository itself instead of relying on prior conversation history.

## Current Repo State

- Repository: `JSvandijk/t3code-mobile`
- Default branch: `main`
- Current public version in `package.json`: `1.1.0`
- Verified on April 21, 2026: local `main` and `origin/main` were brought back to the same commit and the worktree was clean.
- Current synced `HEAD`: `2cb9c0f8d767667c23becedf3bda6a5b92d15179`
- Required GitHub checks on that commit were green on April 21, 2026: `node-checks` and `android-build`

## What Changed In The Latest Cleanup

- The repo was resynced so local `main` and GitHub `origin/main` matched again.
- This handoff file was added so future chats have a stable starting point from the repo itself.
- `README.md` was updated to point new chats and maintainers to this file first.

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
- the latest documented synced commit in this handoff was `2cb9c0f8d767667c23becedf3bda6a5b92d15179`
- the required GitHub checks for that synced state were green
- prior conversation history is not available and should not be assumed

Use a review prompt like this:

```text
Read README.md and docs/CHAT-CONTEXT.md first. Treat docs/CHAT-CONTEXT.md as the authoritative handoff. Then inspect package.json, server.js, webview-harness.js, and apk/app/src/main/java/com/t3code/app/MainActivity.java. Review the repo radically honestly for bugs, risks, regressions, unclear docs, release hygiene problems, and mismatches between stated behavior and implementation. Do not assume you have prior chat history; rely only on the repository state and the handoff.
```

## Maintenance Rule

When major behavior, release process, or repo status changes, update this file in the same commit so future chats inherit current context from GitHub and the local checkout.
