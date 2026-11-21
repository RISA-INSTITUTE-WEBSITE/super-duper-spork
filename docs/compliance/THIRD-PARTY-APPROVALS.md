# Third-party dependency approval register

**RISA Institute website — reviewed 21 November 2026**

This register addresses [issue #9](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/9)
and is the documentary basis for the **narrow** license-audit exceptions in
[`scripts/quality/license-policy.mjs`](../../scripts/quality/license-policy.mjs)
([issue #8](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/8)).

## Decision record and limits

- **Repository owner:** `@learnxul-lang` stated **“approved!”** on
  [issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3#issuecomment-6991988893),
  whose issue description listed the licence families requiring review. Issue #3
  was closed on **18 November 2026**. This records an owner-level *inclusion*
  decision for the dependencies identified there, **not independent legal
  certification** or a blanket approval of additional packages.
- **Exact scope:** Only the names, versions and complete SPDX expressions
  in the inventory below are accepted. They were checked against
  `package-lock.json` on 21 November 2026. CI also checks installed
  `node_modules` manifests, rather than trusting an allowlist alone.
- **Ongoing condition:** On a dependency upgrade, newly introduced binary,
  different SPDX expression or change in deployment/distribution model, obtain
  a new recorded decision. Existing baseline permissive identifiers remain
  governed by the original policy.
- **Compliance distinction:** Passing this automated gate means the current
  packages match the recorded owner-approved inventory. It **does not** prove
  every attribution, licence text, covered-source offer or binary-relinking
  obligation has been fulfilled.

## Reviewed inventory (exact versions and licences)

| Package(s) | Approved version(s) | Declared SPDX | Entries in current lockfile | Compliance review item |
| --- | --- | --- | ---: | --- |
| `@img/sharp-libvips-linux-x64`, `@img/sharp-libvips-linuxmusl-x64` | `1.3.4` | `LGPL-3.0-or-later` | 2 | Verify bundled libvips distribution, licence copy, notices and applicable user-relinking/source obligations |
| `@img/sharp-wasm32` | `0.35.5` | `Apache-2.0 AND LGPL-3.0-or-later AND MIT` | 1 | Retain each licence and notice; confirm wasm and libvips distribution terms |
| `argparse` | `2.0.1` | `Python-2.0` | 1 | Retain relevant copyright and licence notices |
| `axe-core` | `4.14.1` | `MPL-2.0` | 1 | Verify file-level copyleft and notice requirements if redistributed |
| `caniuse-lite` | `1.0.30001826` | `CC-BY-4.0` | 1 | Review attribution and licence-link obligations if redistributed |
| `lightningcss`, `lightningcss-linux-x64-gnu`, `lightningcss-linux-x64-musl` | `1.32.0`, `1.33.0` | `MPL-2.0` | 6 | Review file-level copyleft, notices and actual build-tool redistribution |

**Total:** 12 installed-lockfile entries across 9 exact package names; two
nested versions of the three Lightning CSS names account for 6 entries.
Optional platform packages appear in the lockfile even when not shipped.

## Distribution and notice verification checklist

The source repository currently describes a **Next.js website deployed on
Vercel**, with server code and public browser assets. However, a lockfile is
not evidence of which native binaries or build-time packages a deployable
artifact actually redistributes. An owner or independent compliance reviewer
should record the following before a new commercial distribution or external
release package:

- [ ] Inspect the **exact upstream LICENSE and NOTICE files** for each shipped
  version, together with any bundled native library or wasm source.
- [ ] Identify whether each component is present in browser bundles, server
  deployment, CI-only tooling, or redistributed archives/containers.
- [ ] Provide required copyright acknowledgements, licence copies, source
  notices, and any LGPL/MPL compliance steps appropriate to that distribution.
- [ ] Record reviewer, decision date, evidence links and any required
  follow-up; obtain fresh approval for version or licence-expression changes.
- [ ] Re-enable and verify the **blocking licence-audit CI gate** once the
  reviewed code changes are merged.

No upstream licence texts were copied into this register. The short GitHub
comment cited above does not individually attest that the above checklist was
completed. This checklist therefore remains open for release diligence even
after the *engineering* issues #8 and #9 are closed.

## How the technical control works

The audit keeps its original fail-closed baseline identifiers, with
[`license-policy.mjs`](../../scripts/quality/license-policy.mjs) accepting
the specific reviewed package-version-SPDX tuples. It does **not** add
`LGPL-3.0-or-later`, `MPL-2.0`, `CC-BY-4.0` or `Python-2.0`
globally to the baseline allowlist.

[`assert-license-policy.mjs`](../../tests/security/assert-license-policy.mjs)
checks that all reviewed tuples pass while a new name, different version,
changed SPDX expression or missing declaration remains rejected. The normal
audit traverses all installed `node_modules` manifests and fails if any
unreviewed declaration is found. Run locally with:

```bash
npm ci
node tests/security/assert-license-policy.mjs
node scripts/quality/license-audit.mjs
```

**Record sources:** [issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3)
(owner comment, approval record);
[18 November dependency review](../quality/REMEDIATION-2026-11-18.md);
[issue #8](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/8)
and [issue #9](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/9).
