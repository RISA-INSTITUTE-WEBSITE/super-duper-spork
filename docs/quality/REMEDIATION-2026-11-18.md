# Release blockers and remediation evidence — 18 November 2026

**Repository:** `RISA-INSTITUTE-WEBSITE/super-duper-spork`  
**Branch:** `chore/website-foundation`  
**Release state:** NOT APPROVED — keep draft PR #1 unmerged.

This document captures independently verifiable technical evidence and next actions. It is **not** approval to bypass a quality gate, accept a software licence, publish a course, or release the website.

## 1. Dependency vulnerability — new issue #4

The [website quality-gate run](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44223620529) passed formatting, lint/TypeScript, and the full-history secret scan, but failed at `npm audit --audit-level=high`.

- The audit counted **17 high-severity findings in the dependency tree**, arising from the `picomatch` advisory [GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) / CVE-2026-112366.
- The reviewed advisory, updated 17 November 2026, lists **affected versions through 4.0.7 and no patched release** as of this review.
- The lockfile currently includes `picomatch@2.3.2` (top-level `node_modules/picomatch`) and three copies of `picomatch@4.0.7` under `tinyglobby`, `vite`, and `vitest`. All four are marked `dev: true` in the current lockfile. This is **not** a guarantee of safety; developer/build tooling can still be exposed to untrusted inputs.
- The 17 audit findings are **not 17 independently confirmed exploits in RISA**.

### Safe path to resolution

1. Monitor the official advisory and the upstream [patch PR](https://github.com/micromatch/picomatch/pull/194) for a published, supported fix.
2. When a patched release exists, update the dependent toolchain and `package-lock.json` using npm's resolver, **without `--force` or manually changing integrity hashes**.
3. Run `npm ci`, `npm ls picomatch`, `npm audit --audit-level=high`, `npm run check`, and the full browser/security workflow. Record resulting versions and CI URLs on issue #4.
4. Until then, avoid passing visitor-controlled glob patterns into affected toolchain modules, limit CI to the minimum required permissions, and keep student/user inputs separate from build scripts. These are exposure-reduction measures, **not a replacement for a patched version**.
5. Do **not** lower `npm audit` severity, use `--omit=dev` to disguise the full-audit result, or add a blanket ignore or override to make the gate green.

## 2. Third-party licence review — issue #3

The following unique installed-package families are recorded by `package-lock.json`, and are outside the initial licence allowlist. Versions are **not** legal approvals:

| Family                                    | Lockfile version(s)       | Declared licence                                       | Review items                                                              |
| ----------------------------------------- | ------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `@img/sharp-libvips-*`                    | 1.3.4                     | LGPL-3.0-or-later                                      | Bundled binary and redistribution/linking obligations; source and notices |
| `@img/sharp-wasm32`, `@img/sharp-win32-*` | 0.35.5                    | Apache-2.0 AND LGPL-3.0-or-later (plus MIT for wasm32) | Multiple licence conditions and binaries                                  |
| `lightningcss` plus platform packages     | 1.32.0; 1.33.0 under Vite | MPL-2.0                                                | File-level copyleft, notices and availability of covered source           |
| `axe-core`                                | 4.14.1                    | MPL-2.0                                                | Notices and covered source obligations                                    |
| `caniuse-lite`                            | 1.0.30001826              | CC-BY-4.0                                              | Attribution and licence copy                                              |
| `argparse`                                | 2.0.1                     | Python-2.0                                             | Required notices and licence text                                         |

The lockfile includes platform-specific optional packages for machines other than the production host. **Do not infer what will actually be redistributed** merely from a lockfile entry.

### Maintainer/compliance sign-off required

- [ ] Decide and document the actual hosting/packaging/distribution model.
- [ ] Identify which dependencies ship to browsers, servers, container images or other distributions.
- [ ] Verify each declared licence against the upstream `LICENSE`/`NOTICE` texts for the shipped versions.
- [ ] Obtain explicit approval from a RISA maintainer or appropriate compliance reviewer; record who approved, when, and on what basis.
- [ ] Prepare the required licence copies, attributions, source notices and any applicable availability instructions.
- [ ] Update only the reviewed SPDX identifiers in `scripts/quality/license-audit.mjs`; do not broadly accept all copyleft expressions or turn failures into warnings.
- [ ] Run the full audited CI on the final lockfile and link evidence in issue #3.

**Review status:** Pending human approval. This document intentionally does not update the fail-closed licence allowlist.

## 3. Main-branch enforcement — issue #2

Observed through GitHub REST on 18 November 2026:

- `main` reports **`protected: false`**.
- Reading its branch-protection endpoint returns HTTP 403 (`Resource not accessible by integration`).
- Listing repository rulesets returns HTTP 403 with: **`Upgrade to GitHub Pro or make this repository public to enable this feature.`**
- The connected GitHub App cannot administer branch protection. No rule has been changed.

### Organization-owner action

1. Check the organization's GitHub plan. For a private RISA website codebase, choose a plan that supports enforced private-repository protections. Do **not** make the repository public merely to bypass subscription limits.
2. Visit the [repository ruleset settings](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/settings/rules) as an authorized owner.
3. Target `main`; enforce pull requests, at least one **independent** approval, stale-approval dismissal, required code-owner review, conversation resolution, and up-to-date branches.
4. Require checks **`RISA Required Quality Gate`** and **`Enforce RISA Coding Standards`** (confirm exact names in the GitHub UI).
5. Block direct pushes, deletions, force pushes and bypass actors including administrators; designate independent CODEOWNERS (the current file only names `@learnxul-lang`).
6. Verify protection by attempting a deliberately failing draft PR; it must not be mergeable. Record a screenshot or GitHub rule link and independent reviewer identity in issue #2.

**Review status:** Owner/plan decision required; do not close issue #2 or merge PR #1 until enforcement is verified.

## Release decision

**NO-GO** until all of the following hold:

- All high/critical vulnerability audit findings are resolved through an approved, validated remediation (issue #4).
- Required third-party licences and distribution obligations are reviewed and approved (issue #3).
- `main` branch protection is enabled and enforcement actually tested (issue #2).
- Full CI, build, security checks, and end-to-end tests pass; PR #1 has independent approval.
- The RISA institution signs off on final public copy, branding and proposed programme claims.

Keep the existing security and compliance gates enabled while resolving the blockers.
