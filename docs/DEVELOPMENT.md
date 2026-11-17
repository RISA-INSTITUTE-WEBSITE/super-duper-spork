# RISA website: development guide

## Status

This repository contains the initial **public website scaffold**, not a launched
learning management system. The learning pathways shown in the interface are
illustrative proposals. Authentication, enrollment, dashboards, notifications,
payment and course publishing are **not implemented**.

## Stack

- Next.js 16 (App Router), React 19 and TypeScript
- Tailwind CSS 4
- ESLint (Next.js Core Web Vitals + TypeScript)
- Vitest (unit tests)
- GitHub Actions (website CI)
- Node.js 22

## Work locally

1. Install Node.js 22 (see `.nvmrc`) and npm.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` and open http://localhost:3000.
4. Before committing, run `npm run check` and `npm run build`.

There is no required environment variable yet. Do not commit tokens, passwords,
student data or `.env` files.

### Dependency lockfile

The repository currently lacks a committed `package-lock.json`. Generate it
with `npm install`, then commit and review it before promoting this scaffold
to `main`. Once a lockfile is committed, replace `npm install` with `npm ci`
in `.github/workflows/website-ci.yml` for reproducible CI installs.

## Project layout

```text
src/
  app/
    layout.tsx          # Site shell and metadata
    globals.css         # Tailwind and global styles
    page.tsx            # Homepage
    about/page.tsx
    contact/page.tsx
    programmes/page.tsx
    not-found.tsx
  components/
    site-header.tsx
    site-footer.tsx
  lib/
    pathways.ts         # Illustrative pathway data
    pathways.test.ts    # Example test coverage
.github/workflows/
  ci.yml                # Existing Python quality checks
  website-ci.yml        # Website lint, types, tests and build
```

## Contribution process

1. Create a short-lived branch from the latest `main` (e.g. `feature/course-catalogue`).
2. Keep changes focused; never commit directly to `main`.
3. Open a pull request to `main`, using the template.
4. Wait for CI and team review before merging.
5. Preserve existing Python quality checks until the team decides whether Python will be used.

## Recommended next engineering steps

1. Generate and commit the npm lockfile, then switch CI to `npm ci`.
2. Verify the automated checks and add branch-protection rules.
3. Confirm design tokens, branding, and approved public institution copy.
4. Convert the team's requirements in the separate documentation repository
   into prioritized issues and acceptance criteria.
5. Design authentication/authorization, database schema and privacy controls
   before storing any student or educator data.

The canonical GitHub repository for team feature requirements is
`RISA-INSTITUTE-WEBSITE/RISA-Institution-website`,
file `.github/team_requirements.md`.
