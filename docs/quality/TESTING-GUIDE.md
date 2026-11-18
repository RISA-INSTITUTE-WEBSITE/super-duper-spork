# RISA quality & test reference

**Baseline recorded:** 17 November 2026 (Africa/Johannesburg)  
**Branch:** `chore/website-foundation`  
**Status:** Draft PR #1; not yet accepted on `main`.

This guide defines **why**, **where**, and **how** each automated gate runs.
A passed check is evidence for its specific scope, not proof that the complete
educational platform is secure or available. See
[the dated milestone traceability checklist](../milestones/2026-11-17-development-quality-traceability.md)
for evidence and unfinished work.

## Source map: where to maintain the checks

| Location                                                                     | Responsibility                                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [`.github/workflows/website-ci.yml`](../../.github/workflows/website-ci.yml) | Ordered Node/web PR/push quality job; all steps are sequential and fail fast             |
| [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)                 | Separate Python lint, formatting, mypy and pytest job                                    |
| [`.pre-commit-config.yaml`](../../.pre-commit-config.yaml)                   | Local staged-file hygiene, Ruff, mypy, Gitleaks, Prettier and ESLint                     |
| [`eslint.config.mjs`](../../eslint.config.mjs)                               | TypeScript/React lint, complexity <=10, <=3 parameters and unsafe construct restrictions |
| [`.prettierrc.json`](../../.prettierrc.json)                                 | Website source formatting standard (CI checks without rewriting)                         |
| [`tsconfig.json`](../../tsconfig.json)                                       | Strict TypeScript compiler options                                                       |
| [`vitest.config.ts`](../../vitest.config.ts)                                 | Unit discovery in `tests/unit/`, V8 coverage of `src/lib/` at >=80%                      |
| [`playwright.config.ts`](../../playwright.config.ts)                         | Chromium E2E discovery in `tests/e2e/`, production server and failure traces             |
| [`pyproject.toml`](../../pyproject.toml)                                     | Python Ruff, mypy, style, naming and McCabe complexity                                   |
| [`next.config.ts`](../../next.config.ts)                                     | HTTP headers asserted by integration/E2E tests                                           |
| [`.github/CODEOWNERS`](../../.github/CODEOWNERS)                             | Maintainers to review sensitive paths (enforcement needs branch rules)                   |

## Ordered checks and what a failure means

| ID           | Phase               | Source and command                                                                                                        | Intent and failure behavior                                                                                               |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| QA-LOCAL-01  | Pre-commit          | [`.pre-commit-config.yaml`](../../.pre-commit-config.yaml)                                                                | Fix/check whitespace, YAML/JSON, key material, Python style and website lint before local commit; user must install hooks |
| QA-LOCAL-02  | Pre-commit          | Same file, Gitleaks hook                                                                                                  | Detect likely secrets in staged files; CI separately scans history                                                        |
| QA-PY-01     | Python CI           | [`ci.yml`](../../.github/workflows/ci.yml), `ruff format --check .`                                                       | Fail formatting drift against Python style                                                                                |
| QA-PY-02     | Python CI           | [`ci.yml`](../../.github/workflows/ci.yml), `ruff check .`                                                                | Fail Python naming, docstrings, complexity, errors and unused code                                                        |
| QA-PY-03     | Python CI           | [`ci.yml`](../../.github/workflows/ci.yml), `mypy .`                                                                      | Type-check Python files **if any exist**; skipped if none                                                                 |
| QA-PY-04     | Python CI           | [`ci.yml`](../../.github/workflows/ci.yml), `pytest`                                                                      | Test Python files **if the workflow detects tests**; otherwise skipped                                                    |
| QA-REPRO-01  | Setup               | [`website-ci.yml`](../../.github/workflows/website-ci.yml), `npm ci`                                                      | Fail if `package-lock.json` and dependency manifest disagree                                                              |
| QA-STATIC-01 | 1                   | [`website-ci.yml`](../../.github/workflows/website-ci.yml), `npm run format:check`                                        | Fail Prettier style drift without changing code                                                                           |
| QA-STATIC-02 | 1                   | [`eslint.config.mjs`](../../eslint.config.mjs), `npm run lint`                                                            | Fail ESLint complexity, anti-pattern and style violations                                                                 |
| QA-STATIC-03 | 1                   | [`tsconfig.json`](../../tsconfig.json), `npm run typecheck`                                                               | Fail TypeScript type errors                                                                                               |
| QA-SEC-01    | 2                   | [`website-ci.yml`](../../.github/workflows/website-ci.yml), Gitleaks Docker                                               | Scan Git history for exposed credentials; fail findings                                                                   |
| QA-SEC-02    | 2                   | Same workflow, `npm audit --audit-level=high`                                                                             | Reject reported high/critical package vulnerabilities; not zero-risk assurance                                            |
| QA-SEC-03    | 2                   | [`scripts/quality/license-audit.mjs`](../../scripts/quality/license-audit.mjs)                                            | Fail unreviewed/missing SPDX licenses; requires maintainer legal/compliance review (issue #3)                             |
| QA-SAST-01   | 2                   | [`tests/security/semgrep.yml`](../../tests/security/semgrep.yml)                                                          | Detect disallowed dynamic code, raw HTML and insecure source URLs                                                         |
| QA-BUILD-01  | 3                   | [`website-ci.yml`](../../.github/workflows/website-ci.yml), `npm run build`                                               | Fail if Next.js cannot produce a production build                                                                         |
| QA-UNIT-01   | 3                   | [`tests/unit/pathways.test.ts`](../../tests/unit/pathways.test.ts)                                                        | Prevent duplicate or malformed public pathway slugs                                                                       |
| QA-UNIT-02   | 3                   | Same unit test file                                                                                                       | Ensure pathway display fields are present                                                                                 |
| QA-COV-01    | 3                   | [`vitest.config.ts`](../../vitest.config.ts), `npm run test:coverage`                                                     | Enforce 80% lines/functions/branches/statements **for `src/lib/` only**, not the entire platform                          |
| QA-IAC-01    | 4                   | [`website-ci.yml`](../../.github/workflows/website-ci.yml), Checkov                                                       | Detect IaC/container configuration flaws **only if** supported deployment files exist; otherwise N/A                      |
| QA-HTTP-01   | 4                   | [`tests/integration/http-smoke.sh`](../../tests/integration/http-smoke.sh)                                                | Confirm local built server becomes ready                                                                                  |
| QA-HTTP-02   | 4                   | Same shell test                                                                                                           | Confirm public pages resolve and missing routes return 404                                                                |
| QA-HTTP-03   | 4                   | Same shell test                                                                                                           | Assert CSP, anti-framing and anti-sniffing response headers                                                               |
| QA-DAST-01   | 5                   | [`tests/security/run-zap.sh`](../../tests/security/run-zap.sh), [ZAP rule policy](../../tests/security/zap/rules.conf)    | Active OWASP ZAP check of disposable localhost server; fail configured findings, save report                              |
| QA-E2E-01    | 5                   | [`tests/e2e/public-pages.spec.ts`](../../tests/e2e/public-pages.spec.ts)                                                  | Check homepage heading and landmarks                                                                                      |
| QA-E2E-02    | 5                   | Same Playwright test file                                                                                                 | Check navigation to programmes                                                                                            |
| QA-E2E-03    | 5                   | Same Playwright test file                                                                                                 | Check genuine 404 status and message                                                                                      |
| QA-E2E-04    | 5                   | Same Playwright test file                                                                                                 | Check basic security headers in Chromium test run                                                                         |
| QA-PORT-01   | 5                   | [`website-ci.yml`](../../.github/workflows/website-ci.yml)                                                                | Re-run clean install, types, coverage, build under Node.js 24                                                             |
| QA-GOV-01    | Repository settings | [CODEOWNERS](../../.github/CODEOWNERS) + [issue #2](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2) | Require PR, successful jobs, independent approval and no bypass on `main`; **not enabled by files alone**                 |

## Test commands for developers

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npx playwright install chromium
npm run test:e2e
bash tests/integration/http-smoke.sh
```

Security scanners run in CI using Docker or Python tooling; see
[`website-ci.yml`](../../.github/workflows/website-ci.yml) for exact commands.
The HTTP smoke, E2E and active DAST checks need a production build.
Never run the active DAST script against production or real student data.

## Interpreting the 17 November evidence

- [RISA Website CI run #86](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/43995277559):
  formatting, lint/typecheck, history secrets and npm vulnerability audit passed;
  the license check **failed**; later stages were skipped.
- [RISA Coding Standards CI run #30](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/43995277555):
  passed Python-policy workflow; conditional Python steps may have been N/A.
- The new file locations and commented tests must be **revalidated by fresh CI**.
  Do not reuse past passing results as proof of this revised commit.
- [Branch enforcement issue #2](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2)
  and [license-compliance issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3)
  remain explicit blockers.

## Review policy

A failing required check must block merge. CI YAML alone does not prevent direct
pushes or administrator bypass; configure an enforced GitHub ruleset for the
private `main` branch. An 80% threshold for one tested library does **not**
mean 80% website coverage, and an isolated ZAP scan does not establish an
availability guarantee or replace a professional security assessment.
