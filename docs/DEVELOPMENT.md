# RISA website — Development guide

**Revision:** 17 November 2026 · **Branch:** `chore/website-foundation`  
**Release state:** Draft PR #1. `main` is not updated by this branch.

## Scope

This is a public-site scaffold, **not** a live learning management system.
Listed pathways are illustrative only. Student accounts, enrollment, published
courses, educator dashboards and notifications are not implemented.

## Technology and execution

- Next.js 16, React 19, TypeScript, Tailwind CSS 4
- ESLint / Prettier, Vitest/V8 coverage and Playwright Chromium
- GitHub Actions, Gitleaks, npm audit, custom license audit, Semgrep, Checkov
  when IaC exists, and local OWASP ZAP active DAST
- Node.js 22 is the development target; Node.js 24 compatibility is a CI gate
- `package-lock.json` is committed: use **`npm ci`** for reproducibility

```bash
git switch chore/website-foundation
npm ci
npm run dev
# http://localhost:3000
```

Run checks before requesting review:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
bash tests/integration/http-smoke.sh
```

To enable the local hooks: install Python `pre-commit`, run
`pre-commit install` and `pre-commit run --all-files`.
Only the developer-side formatting hooks may auto-fix files; GitHub CI
**never** silently fixes a PR.

## Repository layout

```text
.github/
  CODEOWNERS                 # Initial owners; ruleset approval still required
  PULL_REQUEST_TEMPLATE.md
  workflows/
    ci.yml                   # Python quality
    website-ci.yml           # Ordered website quality / security / runtime
src/
  app/                       # Next.js pages, layout, styles
  components/                # Shared UI
  lib/pathways.ts            # Illustrative catalogue data
tests/
  unit/pathways.test.ts      # Vitest logic tests
  e2e/public-pages.spec.ts   # Playwright browser acceptance tests
  integration/http-smoke.sh  # Real HTTP route/header checks
  security/
    semgrep.yml              # Custom SAST policies
    run-zap.sh               # Isolated active DAST runner
    zap/rules.conf           # ZAP failure policies
scripts/
  quality/license-audit.mjs  # Fail-closed dependency-license scan
docs/
  DEVELOPMENT.md             # This guide
  quality/
    QUALITY-GATES.md         # Test/merge policy
    TESTING-GUIDE.md         # All checks, IDs, file links and commands
  milestones/
    2026-11-17-development-quality-traceability.md
package.json, package-lock.json, tsconfig.json, next.config.ts,
vitest.config.ts, playwright.config.ts, eslint.config.mjs,
pyproject.toml, postcss.config.mjs, .prettierrc.json
```

**Why configuration remains at the top level:** Next.js, TypeScript,
ESLint, Vitest, Playwright, Python and npm assume or conventionally use
these locations; moving them without explicit flags risks hidden failures.
GitHub workflow files also **must** stay under `.github/workflows/`.

## Contribution and evidence

1. Branch from the latest `main`; make small, focused changes.
2. Add tests and comments describing **why** they exist, not just the steps.
3. Open a PR using the checklist and wait for lint, SAST, build, tests,
   runtime checks and an independent approval.
4. Never bypass failing checks or commit student information, secrets or
   live credentials.
5. Treat a skipped conditional test as **not applicable**, never as a
   demonstration of actual coverage.

For exact QA-ID references, read
[the testing guide](quality/TESTING-GUIDE.md). The milestone status and
outstanding work is recorded in
[the dated traceability checklist](milestones/2026-11-17-development-quality-traceability.md).

## Remaining blockers

- [License compliance, issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3):
  review LGPL/MPL/CC-BY/Python-2.0 declarations before allowlisting.
- [Branch enforcement, issue #2](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2):
  administrator must create and test required-check protection on `main`.
- Full post-refactor CI including SAST, build, coverage, DAST, E2E and
  portability remains unverified until a new green run.

The separate RISA requirements repository contains the team's input:
[`.github/team_requirements.md`](https://github.com/RISA-INSTITUTE-WEBSITE/RISA-Institution-website/blob/main/.github/team_requirements.md).
