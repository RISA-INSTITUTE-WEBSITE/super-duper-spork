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

## Vercel deployment preparation

See [Vercel import settings, preview precautions and launch verification](docs/deployment/VERCEL.md). This is a standard Next.js application at the repository root; it does not need a custom `vercel.json` file. Deployments require a connected RISA-owned Vercel account and an intentional decision to publish or protect the resulting URL.

## Testing and milestone records

- [Testing guide and per-check file references](docs/quality/TESTING-GUIDE.md)
- [Strict quality and merge policy](docs/quality/QUALITY-GATES.md)
- [17 November 2026 milestone traceability checklist](docs/milestones/2026-11-17-development-quality-traceability.md)
- [GitHub branch-protection blocker](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/2)
- [Dependency-license review blocker](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3)
- [Unpatched picomatch dependency vulnerability](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/4)
- [18 November remediation evidence](docs/quality/REMEDIATION-2026-11-18.md)

Tests are grouped in `tests/unit/`, `tests/e2e/`, `tests/integration/`,
and `tests/security/`. Keep Next.js and tooling configuration files at the
repository root because their tools discover those conventional paths.

## Work together

Contribute through feature branches and pull requests; do not commit directly
to `main`. Read the [development guide](docs/DEVELOPMENT.md) for the
folder structure, planned next steps, and guidelines.

**Current release risks:** Website foundation PR #1 has already been merged into
`main`. The dependency and licence audits run with documented **non-blocking
exceptions**, but their findings remain unresolved. Branch protection is not
enabled on `main`. Do not treat CI success or a preview URL as sign-off for
an unrestricted production launch; see the deployment checklist.

The initial team feature requests live in
[`RISA-Institution-website/.github/team_requirements.md`](https://github.com/RISA-INSTITUTE-WEBSITE/RISA-Institution-website/blob/main/.github/team_requirements.md).
