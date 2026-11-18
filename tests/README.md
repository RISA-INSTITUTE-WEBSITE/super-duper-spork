# RISA automated test suite

This folder is organized by **test responsibility**, not by execution order.
The ordered CI entry point remains
[`.github/workflows/website-ci.yml`](../.github/workflows/website-ci.yml).

- **`unit/`** — Vitest: isolated pathway data and utility behavior.
- **`e2e/`** — Playwright: browser-visible public user journeys.
- **`integration/`** — Shell tests: running Next.js server, HTTP routes
  and response security headers.
- **`security/`** — Semgrep source policies, local ZAP DAST runner and
  the ZAP failure-rule configuration.

Every executable test has a **QA ID** and an in-file comment stating why it
exists. QA IDs, commands, expected failures, evidence and limitations are
cross-referenced in
[the testing guide](../docs/quality/TESTING-GUIDE.md).

Do not interpret a skipped phase (for example, after a failing license audit)
as a pass. See the
[17 November 2026 milestone record](../docs/milestones/2026-11-17-development-quality-traceability.md)
for the verification checklist.
