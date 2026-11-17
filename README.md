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
Vitest, and GitHub Actions. Node.js 22 is required for the development setup.

## Quick start

```bash
npm install
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

## Work together

Contribute through feature branches and pull requests; do not commit directly
to `main`. Read the [development guide](docs/DEVELOPMENT.md) for the
folder structure, planned next steps, and guidelines.

**Before merging:** Generate and commit `package-lock.json`, switch website
CI from `npm install` to `npm ci`, and verify the CI results.

The initial team feature requests live in
[`RISA-Institution-website/.github/team_requirements.md`](https://github.com/RISA-INSTITUTE-WEBSITE/RISA-Institution-website/blob/main/.github/team_requirements.md).
