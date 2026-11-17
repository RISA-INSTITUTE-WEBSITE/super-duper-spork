# RISA milestone traceability record — 17 November 2026

> **Snapshot date:** Tuesday, 17 November 2026, Africa/Johannesburg  
> **Repository:** [super-duper-spork](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork)  
> **Development branch:** `chore/website-foundation`  
> **Change review:** [Draft PR #1](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/pull/1)  
> **Milestone label:** Website foundation, organized test suite, strict coding-quality pipeline  
> **Record state:** **Documented/archived as a 17 November development snapshot — NOT released or accepted on `main`.**

Use `[x]` for a **verified** completed item, `[ ]` for incomplete, blocked,
conditional or needing a post-refactor CI run. Files existing is not evidence
that their tests have passed.

## A. Traceability checklist: requirement → implementation → evidence

| ID | Milestone acceptance criterion | Artifact / verification source | 17 Nov |
| --- | --- | --- | --- |
| M-01 | Dedicated development branch created; `main` unchanged | [PR #1](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/pull/1) | [x] |
| M-02 | Initial Next.js/React/TypeScript/Tailwind public scaffold committed | [`src/app/`](../../src/app), [`package.json`](../../package.json) | [x] |
| M-03 | Unit, E2E, integration and security test locations organized | [`tests/`](../../tests), [test catalogue](../quality/TESTING-GUIDE.md) | [x] |
| M-04 | Tests include inline intent/behavior comments | [unit](../../tests/unit/pathways.test.ts), [browser](../../tests/e2e/public-pages.spec.ts), [HTTP](../../tests/integration/http-smoke.sh), [ZAP](../../tests/security/run-zap.sh) | [x] |
| M-05 | Ordered quality stages declared and paths updated | [web CI](../../.github/workflows/website-ci.yml), [Python CI](../../.github/workflows/ci.yml) | [x] |
| M-06 | Deterministic `npm ci` and tracked lockfile | [lockfile](../../package-lock.json), [web CI](../../.github/workflows/website-ci.yml) | [x] |
| M-07 | Pre-commit hygiene and secret prevention documented | [hooks](../../.pre-commit-config.yaml), [guide](../quality/TESTING-GUIDE.md) | [x] |
| M-08 | Formatting, lint, TypeScript, secret scan and npm high-severity audit proven on an earlier run | [CI #86](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/43995277559) | [x] |
| M-09 | Existing Python CI previously succeeded | [Python CI #30](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/43995277555) | [x] |
| M-10 | Every refactored file path validated in new CI run | Latest PR checks (review after this commit) | [ ] |
| M-11 | Dependency license audit approved and passing | [issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3) | [ ] |
| M-12 | Semgrep SAST executed and passed | [SAST rules](../../tests/security/semgrep.yml), web CI | [ ] |
| M-13 | Next.js build and >=80% **scoped `src/lib`** coverage passed | [unit tests](../../tests/unit/pathways.test.ts), [Vitest config](../../vitest.config.ts) | [ ] |
| M-14 | HTTP routing/headers and conditional IaC checks passed | [HTTP smoke](../../tests/integration/http-smoke.sh), web CI | [ ] |
| M-15 | ZAP DAST, Playwright E2E and Node 24 portability passed | [ZAP](../../tests/security/run-zap.sh), [browser tests](../../tests/e2e/public-pages.spec.ts), web CI | [ ] |
| M-16 | `main` protected: required checks, peer approval, CODEOWNERS, no bypass | [issue #2](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2), repository ruleset | [ ] |
| M-17 | PR reviewed, approved and merged only after all required gates | [PR #1](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/pull/1) | [ ] |
| M-18 | Official branding/copy approved by RISA maintainers | Team approval evidence to attach to PR | [ ] |

## B. Security/quality evidence crosswalk

| Risk or quality attribute | Gate IDs | Evidence and limits |
| --- | --- | --- |
| Readable, maintainable code | QA-LOCAL-01, QA-STATIC-01/02, QA-PY-01/02 | Style and complexity checks cannot replace code review |
| Secure commits and dependencies | QA-LOCAL-02, QA-SEC-01/02/03 | License approval remains blocked; dependency scans do not cover all threats |
| Application code safety | QA-SAST-01, QA-DAST-01, QA-HTTP-03 | Added, not fully run through the full pipeline |
| Functional reliability | QA-BUILD-01, QA-UNIT-01/02, QA-COV-01, QA-HTTP-01/02, QA-E2E-01..04 | Tests cover the **public scaffold**, not future authentication or enrollment |
| Portability | QA-REPRO-01, QA-PORT-01 | Node 24 matrix not yet verified |
| Operational availability | QA-HTTP-01 | Local smoke check only; **no uptime monitoring, load or recovery SLA test yet** |
| Merge governance | QA-GOV-01 | Ruleset requires configuration outside Git files |

All QA IDs and exact file responsibilities are defined in
[TESTING-GUIDE.md](../quality/TESTING-GUIDE.md).

## C. Release-blocking action checklist

- [ ] RISA maintainer reviews the exception list for LGPL, MPL, CC-BY and
      Python-2.0 licenses, documents obligations and resolves
      [issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3).
- [ ] All mandatory CI stages are green on **the final PR head commit**.
- [ ] Configure an enforced `main` branch ruleset for the private repo:
      independent approval, code-owner review, both required checks,
      no bypass and no force push (see
      [issue #2](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2)).
- [ ] Test the ruleset with a deliberately failing PR and confirm merge denial.
- [ ] Obtain independent approval and record the release decision before merge.

**Milestone archive statement:** This checklist preserves what was achieved
and what remained open on 17 November 2026. It is **not** a certification of
security, a claim that all checks passed, or permission to merge.
