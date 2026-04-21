# Upstream Fit

This project is most credible to `pingdotgg/t3code` when it stays narrow and reliability-focused.

## Principles

- Keep the scope tight: mobile access to an existing T3 Code session, not a fork of the full product.
- Prefer reliability work over novelty work: clearer failure states, better diagnostics, safer defaults, and stronger smoke tests.
- Keep changes explainable: every meaningful UX or behavior change should map back to a real operator problem.
- Provide evidence: screenshots for UI changes, short videos for interaction-heavy changes, and repeatable smoke checks for infrastructure work.

## What This Repo Tries To Prove

- A mobile companion can be built without turning T3 Code into a different product.
- WebView-based access can still be handled with disciplined security defaults and visible error handling.
- Small self-hosted tools benefit from observability too: copyable diagnostics in the app and a health endpoint in proxy mode make support and triage much faster.

## Good Upstream-Friendly Change Shapes

- Small reliability fixes
- Safer defaults
- Better diagnostics
- Narrow performance improvements
- Documentation that reduces maintainer guesswork

## Change Shapes To Avoid

- Broad feature work that changes product direction
- Large UI rewrites without evidence
- Complex abstractions that hide straightforward behavior
- Any change that makes the app feel like a generic browser or remote-agent platform
