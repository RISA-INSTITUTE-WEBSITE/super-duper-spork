# RISA quality gates and merge policy

This policy adapts the attached **BIH Coding Standards** principles for the
TypeScript website. Python modules retain PEP 8, Ruff and mypy checks.

## Quality requirements

- Name variables descriptively; use camelCase for JS variables/functions,
  PascalCase for React components/types, and kebab-case for web paths.
- Keep functions focused (ESLint complexity <=10 and maximum 3 parameters).
- Prefer typed functions, explicit error handling, small units and tests.
- Document **why** complex business logic exists, rather than restating code.
- Use feature branches and pull requests. Never commit secrets or student PII.
- Add regression tests for every bug fix and security-sensitive change.
- Refrain from introducing raw HTML, dynamic evaluation and insecure HTTP calls.

## Where the checks live

See [TESTING-GUIDE.md](TESTING-GUIDE.md) for each control, its exact file,
failure behavior and current verification evidence.

- GitHub Actions: `../../.github/workflows/website-ci.yml` and
  `../../.github/workflows/ci.yml`
- Unit and E2E tests: `../../tests/unit/` and `../../tests/e2e/`
- Security policies: `../../tests/security/`
- License script: `../../scripts/quality/license-audit.mjs`
- Commit hooks: `../../.pre-commit-config.yaml`

## Local checks

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm exec playwright install chromium
npm run test:e2e
```

Install Python `pre-commit` if desired, then run
`pre-commit install` and `pre-commit run --all-files`. Local hooks can
auto-fix formatting; CI never modifies code.

## Ordered pull request checks

1. **Static:** Prettier, ESLint/complexity, TypeScript, Python Ruff/mypy.
2. **Security:** Gitleaks history scanning, dependency vulnerability audit,
   license declaration and Semgrep local SAST rules.
3. **Build and unit:** Next.js production build, Vitest unit coverage >=80%
   **of current src/lib modules**, not the entire website.
4. **Integration:** HTTP route smoke and basic security-header validation.
5. **Runtime:** Playwright Chromium E2E; active OWASP ZAP DAST against a localhost
   production-mode server, followed by Node.js 24 portability validation.

The thresholds apply to **the currently tested code only**. As the platform
gains accounts, databases and APIs, expand coverage to route handlers, services,
data access, authorization and UI components before calling 80% broad coverage.

IaC/container security scans will be mandatory when Docker, Terraform or
Kubernetes files are introduced; no such deployment artifacts were verified
in the initial website scaffold.

## GitHub merge rules (configuration outside the repository)

Quality-gate workflows DO NOT themselves prevent administrator bypasses or
direct pushes. Configure a branch ruleset/protection on `main`:

- Require a PR and >=1 other person's approval, dismiss stale approvals.
- Require CODEOWNERS review, resolve conversations, and use merge queue if
  supported by the GitHub plan.
- Require unique job `RISA Required Quality Gate` and existing
  `Enforce RISA Coding Standards` statuses to pass.
- Require up-to-date branches and disallow force pushes and deletions.
- Apply protections to administrators; allow **no bypass actors**.
- Restrict direct pushes to `main`. Do not allow auto-merge without checks.

**Important:** For private repositories, GitHub branch protection/rulesets
require an eligible plan. If not available, these settings cannot be enforced.
The owners must adjust the GitHub plan or repository visibility as appropriate.

## Known limitations

- GitHub CodeQL in a private repository needs eligible GitHub Code Security.
  This starter uses a local Semgrep rule pack instead. Expand rules and consider
  paid CodeQL when available.
- An automated ZAP active scan against a throwaway localhost service is not a substitute for authenticated penetration testing; never target live student data.
- License auditing flags non-approved SPDX licenses for manual review; consult
  counsel for redistribution obligations.
- The lockfile is committed and CI uses reproducible `npm ci` installs.
- The initial license scan flagged LGPL, MPL, CC-BY and Python-2.0 package declarations. Resolve issue #3 before merging.
- Security scanners can generate false positives; review findings, avoid silently
  disabling checks, and document justified exceptions.
