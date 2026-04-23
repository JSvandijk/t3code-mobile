# AGENTS.md

This file captures the quality rules that came out of the April 23, 2026 external review of `t3code-mobile`.

Use it as:

- the project instruction file for this repository
- a carry-forward template for future repositories

If this file is copied to another project, keep the portable rules and replace the repo-specific section.

## Repo-Specific Context

- Repository: `JSvandijk/t3code-mobile`
- Product: Android WebView wrapper plus optional HTTPS/PWA proxy for T3 Code
- Highest-risk areas in this repo:
  - `server.js` security headers, escaping, buffering, caching, health output, startup logging
  - `apk/app/src/main/java/com/t3code/app/MainActivity.java` platform APIs, WebView safety, upload injection flow
  - `sw.js` cache scope and cache cleanup behavior
  - `docs/SECURITY-AUDIT.md`, `README.md`, and `docs/evidence/*` consistency with the current code state

## Portable Quality Gate

These are mandatory steps before calling work complete.

### 1. Security Sweep

- Check every HTTP response, log line, startup banner, and console output for filesystem paths, secrets, tokens, config values, and internal state.
- Tie every finding to a concrete threat model. Distinguish operator-only output (stdout, local logs) from network-reachable output (HTTP endpoints, response headers). Do not file a finding if you cannot answer: who sees this, how, and what does it give an attacker?
- Check every HTML template for unescaped dynamic values. Use `escapeHtml()` or equivalent.
- Verify CSP coverage on every response path that serves HTML or browser-consumed content.
- Review every cache layer: service worker, HTTP cache, in-memory cache, temp files.
- Add explicit size limits to buffered responses, decompression, uploads, and in-memory aggregation.
- Review error handlers. Do not silently swallow errors that affect correctness or security.

### 2. Consistency Check

- Read code, docs, audits, release notes, and evidence against each other.
- If a document claims a mitigation exists, verify the mitigation in code.
- If evidence references a commit or SHA, confirm it matches the code being reviewed.
- If README claims a feature, make sure it is testable or clearly marked as not yet verified.
- Treat any code/doc/audit mismatch as a bug, not as a documentation follow-up.

### 3. Platform Check

- Check deprecated APIs against the minimum and target platform versions.
- `@SuppressWarnings("deprecation")` is not a fix. Replace deprecated behavior with the supported API unless there is a documented blocker.
- Verify behavior on both minimum-supported and target-supported platform assumptions.

### 4. Cleanup

- Remove dead code, stale files, duplicate implementations, and unused imports.
- Check whether new files are tracked and not accidentally hidden by `.gitignore`.
- When adding a new implementation, check whether an older path should be removed or explicitly retained.
- Do not let temporary workspaces, generated harness files, or local artifacts become part of the implied runtime path unless intentional.

### 5. Definition of Done

- Green checks are necessary, not sufficient.
- Local-only changes are not done work for a GitHub-facing project.
- Evidence is not valid if it describes an older runtime state than the current code.
- If something was not verified, say `not verified`.
- Do not say `done`, `complete`, or `ship-ready` unless code, docs, evidence, and git state all support that claim.

### 6. Adversarial Self-Review

- After implementation, try to break your own output.
- Ask: `What would a hostile reviewer attack first?`
- Fix the strongest known weakness before closing the task.
- If the weakness cannot be fixed in the current pass, call it out explicitly as an open risk.

## Current Lessons From This Repo

- Security fixes that exist only in a dirty worktree are not reliable progress.
- Evidence drift is a real failure mode. Old screenshots and old check logs are not proof for newer code.
- Documentation can be polished while still overstating reality.
- Small code smells matter because they reduce reviewer trust.
- If a project has much more process text than executable verification, add tests before adding more narrative.

## Review Priorities For This Repo

When touching this repository, explicitly check for:

- uncommitted security or release-critical changes
- mismatch between `docs/evidence/` and the current runtime code
- deprecated Android APIs in `MainActivity.java`
- information disclosure in proxy startup logs and health output
- service worker cache scope and cleanup correctness
- README repetition, overclaiming, and proof language that exceeds what the tests actually verify

## Reuse In A New Project

When copying this file to another repository:

1. Keep `Portable Quality Gate`.
2. Replace `Repo-Specific Context`.
3. Replace `Review Priorities For This Repo` with the real hot spots of the new codebase.
4. Add the project's own high-risk files, evidence model, and release rules.

## Operational Rule

If a future review exposes a recurring failure mode, update this file in the same pass so the lesson becomes part of the project, not just part of a chat.
