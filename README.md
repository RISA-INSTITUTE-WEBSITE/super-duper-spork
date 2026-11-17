# RISA Institute of Applied Sciences — Website

This repository is designated for development code for the RISA Institute of
Applied Sciences website.

## Project status

**Foundation scaffold — not production-ready.** The current website offers
a public homepage, proposed learning pathways, About and Contact pages.
The proposed pathways are examples only and are **not confirmed courses**.
There are no working student accounts, enrollment, educator portals, or
administration dashboards yet.

## Technology

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, ESLint,
Vitest, Playwright, and GitHub Actions. Node.js 22 is required for the development setup.

## Quick start

```bash
npm ci
npm run dev
```

Visit http://localhost:3000 to see the website.

## Quality checks

```bash
npm run check
npm run build
```

Automated checks run via
[Website CI](.github/workflows/website-ci.yml). Existing Python CI remains
separate in [ci.yml](.github/workflows/ci.yml).

## Testing and milestone records

- [Testing guide and per-check file references](docs/quality/TESTING-GUIDE.md)
- [Strict quality and merge policy](docs/quality/QUALITY-GATES.md)
- [17 November 2026 milestone traceability checklist](docs/milestones/2026-11-17-development-quality-traceability.md)
- [GitHub branch-protection blocker](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2)
- [Dependency-license review blocker](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3)

Tests are grouped in `tests/unit/`, `tests/e2e/`, `tests/integration/`,
and `tests/security/`. Keep Next.js and tooling configuration files at the
repository root because their tools discover those conventional paths.

## Work together

Contribute through feature branches and pull requests; do not commit directly
to `main`. Read the [development guide](docs/DEVELOPMENT.md) for the
folder structure, planned next steps, and guidelines.

**Before merging:** The dependency lockfile is tracked and CI uses `npm ci`,
but the licence-compliance gate and repository-level required-check rules
are still outstanding. **Do not merge Draft PR #1** until all checks pass and
the private `main` branch is protected.

The initial team feature requests live in
[`RISA-Institution-website/.github/team_requirements.md`](https://github.com/RISA-INSTITUTE-WEBSITE/RISA-Institution-website/blob/main/.github/team_requirements.md).
