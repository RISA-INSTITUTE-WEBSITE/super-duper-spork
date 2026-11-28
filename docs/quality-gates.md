# RISA CI/CD quality gates

## Pull requests

The existing required status name is **RISA Required Quality Gate**. It
aggregates independently running code-quality, security, unit-test, and
production build/browser jobs. It fails if a required job fails, is cancelled,
or is unexpectedly skipped. Applicable extended checks also block the gate.

- Code quality: read-only Prettier, ESLint (including complexity), TypeScript.
- Security: full-history Gitleaks, npm audit, license policy, Semgrep.
- Unit tests: Vitest with 80% lines, statements, branches and functions coverage
  for the configured library scope.
- Production verification: Next.js build, HTTP and security-header smoke checks,
  and the full Chromium Playwright suite.
- Existing Python Studio and Python standards workflows remain unchanged.

The existing owner-approved npm audit exception remains temporarily non-blocking.
All other existing scan policies and thresholds remain unchanged.

## Extended checks and releases

The workflow runs nightly at 02:30 SAST (00:30 UTC), on main pushes, and when
manually dispatched. OWASP ZAP runs against an isolated local server, not
production. ZAP reports and failed browser diagnostics are retained as artifacts.

Node.js 24 portability also runs on dependency/runtime changes. Infrastructure
scanning is selected for relevant infrastructure changes and only executes
Checkov when applicable manifests exist. Security-sensitive changes select ZAP.
Workflow changes and unknown change ranges conservatively select extended checks.

Before a production release, label the release-candidate PR `release` and
require a successful aggregate gate on the exact candidate commit. For a
manual release from an already merged commit, dispatch RISA Website CI on that
ref and require success before promoting. Nightly and main-push runs alone do
not prevent an automatic production deployment. Configure GitHub branch
protection and Vercel Deployment Checks to require the aggregate status before
production promotion. Do not bypass failures or treat an old run as approval.

Linux Studio releases additionally require a live, administrator-authorized
sandbox smoke test in a configured Vercel environment: command execution, output
and exit status, file and working-directory persistence, authorization, and
network isolation. Record the result against the release commit; the local
browser fixture is not a substitute for that test.

## Local pre-commit checks

After cloning, run:

```bash
npm ci
npm run hooks:install
```

The hook automatically formats staged files, stages their formatted versions,
then runs the repository lint policy. It refuses partially staged files to avoid
accidentally committing unstaged changes. It also refuses to overwrite an
unrelated existing hook. Re-run installation after hook updates. CI remains
authoritative for web edits, bots and clients that do not execute local hooks.

Before pushing, run `npm run check` for formatting, lint, typing, unit coverage,
and the production build. For browser verification, install Chromium using
`npx playwright install --with-deps chromium`, then run `npm run test:e2e`.

## Branch protection

Keep the existing required check name and require pull requests to pass it
before merging into main, including for administrators where policy permits.
Actual repository and Vercel settings must be verified independently; the
workflow itself cannot enforce external deployment or branch protection.
