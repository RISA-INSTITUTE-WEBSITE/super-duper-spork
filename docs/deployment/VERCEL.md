# RISA Vercel deployment checklist

Updated: 18 November 2026

## Deployment intent

Deploy the existing **public-information-only** RISA Institute of Applied Sciences website (Next.js App Router). The site is still under development: no student enrollment, accounts, payment, or confirmed programmes are offered.

**Do not deploy to an unrestricted production URL without a deliberate release decision.** GitHub issue #2 (branch protection), #3 (licence approval), and #4 (dependency advisory) remain open. The dependency and licence checks currently execute as **non-blocking exceptions** in GitHub Actions. A green CI result does not clear these findings.

## Vercel import settings

1. Sign into the RISA-owned Vercel team/account at [vercel.com/new](https://vercel.com/new).
2. Use **Add New → Project**, connect the **GitHub** provider, and authorize the organization `RISA-INSTITUTE-WEBSITE` to access only the necessary repository.
3. Import the private repository **`RISA-INSTITUTE-WEBSITE/super-duper-spork`**. The GitHub organization owner may need to approve installation permissions.
4. Set **Project Name:** `risa-institute-website` (or another available RISA-owned name).
5. Set **Framework Preset:** Next.js (auto-detected).
6. Set **Root Directory:** `./` (repository root). Do not select `src/`.
7. Set **Production Branch:** `main`.
8. Use **Install Command:** `npm ci` and **Build Command:** `npm run build`. Let Vercel manage the Next.js output directory; do not set `dist`, `out`, or a custom build artifact path.
9. Select **Node.js 22.x** in project Build & Deployment settings (matches `.nvmrc` and `package.json`).
10. **Environment Variables:** None are required by the current public scaffold. Add new values only when implementing features that need them. Never commit credentials or place server secrets in `NEXT_PUBLIC_*` variables.
11. For first review, keep **preview deployment access restricted** using the available deployment-protection controls on your Vercel plan. If this cannot be configured, assume preview URLs may be accessible to anyone with the link; do not put private student or institutional data in the site.
12. For this preflight, **do not attach a custom domain or announce a production launch**.

Vercel commonly creates a production deployment from `main` upon Git import. Importing is therefore an **external release action** even if you only want to inspect the site. Review and approve that consequence before clicking **Deploy**. To use an isolated preview first, deploy a non-production branch through the Vercel project after integration and review its generated preview URL.

## Verification before sharing a URL

- [ ] GitHub production build, unit, integration, security, Playwright and Node portability checks are passing (except the explicitly documented temporary audit exceptions).
- [ ] Evaluate the GitHub Actions ZAP report and address any real security alerts.
- [ ] Confirm the deployed site matches the current GitHub commit and responds with HTTP 200 on `/`, `/about`, `/programmes`, `/contact`.
- [ ] Confirm a missing URL returns HTTP 404, and verify CSP, X-Content-Type-Options, and X-Frame-Options response headers.
- [ ] Check mobile navigation, typography, proposed pathway disclaimers, keyboard accessibility, and contrast on the public pages.
- [ ] Confirm there are no credential leaks, missing images, external-only resources, or unintended user data.
- [ ] Independently review the outstanding branch protection, legal/compliance and dependency risks before enabling unrestricted production access.
- [ ] After deployment, record the actual generated Vercel URL and Git commit in this document or an approved release record. **Do not guess a URL.**

## Common troubleshooting

- **Repository missing in Vercel:** ask an organization owner to grant the Vercel GitHub integration access to `super-duper-spork`; check that the team has appropriate organization permissions.
- **Framework or output error:** use Next.js preset, root `./` and default output; this project is not a static HTML or Vite application.
- **Node mismatch:** select Node.js 22.x.
- **Build fails:** inspect deployment logs, run `npm ci && npm run build` with Node 22 locally, and compare with GitHub Actions.
- **Works locally but not on Vercel:** examine routing, runtime logs, deployment protection, environment configuration and exact commit SHA.

Official references: [Vercel Git integration](https://vercel.com/docs/git), [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [build configuration](https://vercel.com/docs/builds/configure-a-build).

This document prepares a deployment. It does **not** connect a Vercel account, create a project, or publish the website.
