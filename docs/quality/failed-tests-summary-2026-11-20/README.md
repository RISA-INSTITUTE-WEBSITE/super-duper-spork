# Failed Tests Summary (20 November 2026)

**Repository:** [RISA Institute website](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork)  
**Date reviewed:** 20 November 2026  
**Evidence:** [RISA Website CI #612](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44657384532) (pull-request commit `cd284cf10ab973f650eb3b6d096413d7502302ad`), plus earlier failed [CI #610](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44655612615) and [CI #597](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44651635088).  
**Important:** This is a review of recorded CI results and related source code, **not** a penetration-test certificate or proof that RISA has been hacked.

## 1. What happened? (Simple explanation)

RISA runs automated tests before accepting website changes. The latest reviewed `RISA Website CI` job ended in **failure** because the OWASP ZAP website security scanner reported **five types of warnings**, and its command returned exit code **2**. The scan visited **66 URLs**, reported **138 passing rules**, **0 rules classified as FAIL**, and **5 types of new warnings**. The warnings must be checked, but **a warning is not proof of an exploitable vulnerability**.

A separate **dependency licence check also failed its own command** because some packages use licences that the current allowlist does not recognise. GitHub displays that step as successful because a temporary `continue-on-error: true` setting allows the workflow to carry on. The package-vulnerability scan, in contrast, reported **0 vulnerabilities**.

Tests scheduled **after ZAP** did not run. A skipped test is **not a passed test**.

## 2. Which tests failed, warned, passed, or did not run?

| Test/check | Result in CI #612 | Meaning in plain English |
| --- | --- | --- |
| OWASP ZAP active website scan | **Failed as a CI step** (exit 2; five warning categories) | The scanner saw settings or pages worth investigating; it did not report a confirmed high-severity exploit in this run. |
| Dependency licence audit | **Underlying command failed** (exit 1; temporarily non-blocking) | Twelve installed package entries had licences outside the script's small approved list. This is primarily a compliance decision, not a vulnerability finding. |
| Dependency vulnerability audit (`npm audit --audit-level=high`) | **Passed** | NPM reported zero known vulnerabilities at the time of this run. |
| Gitleaks full-history secrets scan | **Passed** | The scan reported no exposed secrets in the scanned Git history (488 commits); this does not guarantee all secrets are absent everywhere. |
| Semgrep source-code security rules | **Passed** | The configured local rules produced no blocking finding; coverage is limited to those rules and scanned paths. |
| HTTP routes and response-header smoke test | **Passed** | Selected pages and basic headers worked; this test does not check every security-header policy detail. |
| Infrastructure-as-code (Checkov) | **Not applicable / no scan executed** | The workflow did not find Docker, Terraform, or Kubernetes deployment files to inspect. |
| Formatting, lint/typecheck, build, unit coverage | **Passed** | The checked code built and met the current automated requirements; lint did emit one non-blocking warning. |
| Playwright browser tests | **Skipped** | ZAP failed first, so the browser tests were not reached. No current pass/fail conclusion follows. |
| Node.js 24 portability/build tests | **Skipped** | These tests were also not reached after the ZAP failure. |
| Separate RISA Coding Standards CI | **Passed** | That other workflow was successful for the reviewed pull-request commit. |

## 3. Each OWASP ZAP warning, explained simply

The five categories below all appeared in [CI #612's ZAP output](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44657384532). Numbers such as `10055` are the scanner's rule IDs; the `x` counts are reported instances, **not** separate confirmed vulnerabilities.

### Warning A — Content Security Policy allows broad sources (rule 10055; x9)

**What it means:** A Content Security Policy (CSP) tells the browser which resources the website should accept. A broad rule may allow resources from more places than RISA actually needs. This can weaken protection if another problem, such as script injection, is later discovered.

**Code to inspect:** [`next.config.ts` lines 14–26](../../../next.config.ts#L14-L26) defines the response security policy, including:

```ts
"img-src 'self' data: https:",
"style-src 'self' 'unsafe-inline'",
"script-src 'self' 'unsafe-inline'",
```

The broad `https:` image permission is relevant to the wildcard/scheme warning. The `'unsafe-inline'` directives are additional settings worth reviewing; **the log does not prove they caused rule 10055**.

**What to do:** List the real image, script, style, and iframe origins needed by the website. Tighten permissions where technically possible, without breaking Next.js, Supabase or YouTube content. Re-run ZAP and verify the site still works.

**Status:** A configuration warning; no successful XSS attack was demonstrated by this result.

### Warning B — No visible anti-CSRF token on account forms (rule 10202; x4)

**What it means:** CSRF is when another website tricks a signed-in browser into submitting an unwanted request. A traditional defence is a special anti-CSRF token in the form.

**Code to inspect:**
- [`src/app/students/login/page.tsx` line 78](../../../src/app/students/login/page.tsx#L78) uses `<form action={signInStudent}>`.
- [`src/components/student-registration-form.tsx` line 37](../../../src/components/student-registration-form.tsx#L37) uses `<form action={registerStudent}>`.
- [`src/app/students/actions.ts` lines 23–93](../../../src/app/students/actions.ts#L23-L93) contains the registration and sign-in Server Actions.

**Why this might be a false alarm:** These are **Next.js Server Actions**, not necessarily ordinary custom form endpoints. Next.js has built-in request/origin protections, and an anti-CSRF token may not appear in the HTML in the way ZAP expects. RISA also sets session cookies to `SameSite=Lax`; see [`src/lib/student-session.ts` lines 12–17](../../../src/lib/student-session.ts#L12-L17). **None of those facts alone guarantees protection.**

**What to do:** Review the framework's actual request and Origin validation, cookie behaviour, proxy/host settings, and whether cross-site requests can change a learner's session or data. Add explicit protection if a tested route needs it; do not add a decorative hidden token merely to silence ZAP.

**Status:** Needs a focused manual security test; exploitability not established.

### Warning C — Additional anti-CSRF check (rule 20012; x6)

**What it means:** This is a **second scanner rule about the same account-form protection concern**, not automatically six more independent flaws. It also reported the login and registration pages.

**Code to inspect:** The same form and Server Action paths as Warning B, especially [`src/app/students/actions.ts` lines 23–93](../../../src/app/students/actions.ts#L23-L93) and [`src/lib/student-session.ts` lines 12–17](../../../src/lib/student-session.ts#L12-L17).

**What to do:** Investigate **together with Warning B**. Check how Server Actions reject untrusted cross-origin requests and whether sensitive authenticated actions are protected.

**Status:** Needs verification; do not count it as a proven separate exploit.

### Warning D — Possible source-code disclosure through a file/image request (rule 43; x1)

**What it means:** The scanner saw a response it associates with a possible file-inclusion or source-disclosure problem. In this run, the reported request was:

```text
/_next/image?q=75&url=%2Fimages%2Frisa-home%2Fdevops.png&w=3840
HTTP response: 404 Not Found
```

**Code to inspect:**
- [`src/components/hero-photo-background.tsx` lines 4–8](../../../src/components/hero-photo-background.tsx#L4-L8) lists `"/images/risa-home/devops.png"`.
- [`src/components/hero-photo-background.tsx` lines 23–35](../../../src/components/hero-photo-background.tsx#L23-L35) renders the photo using Next.js `<Image>`.
- [`next.config.ts` lines 35–38](../../../next.config.ts#L35-L38) controls allowed remote image sources.

**What to do:** Inspect the **actual response body and headers** from the isolated local test server. Confirm the image file is present and that malformed image requests cannot expose server paths, source files, environment data or stack traces. A **404 alone is not evidence that source code was disclosed**; it may be a false positive or an image-optimiser error.

**Status:** Unconfirmed scanner warning, not confirmed source disclosure.

### Warning E — Cross-Origin-Resource-Policy header missing/invalid (rule 90004; x10)

**What it means:** The browser may have fewer instructions about which other websites can use certain RISA resources. This does **not** automatically mean learner information is exposed.

**Code to inspect:** [`next.config.ts` lines 3–31](../../../next.config.ts#L3-L31) sets several headers (for example `X-Content-Type-Options` and `Content-Security-Policy`), but does not currently define `Cross-Origin-Resource-Policy`. The scanner mentioned the homepage and `risa-logo.svg` among affected resources.

**What to do:** Decide which resources should be same-origin, same-site, or intentionally available across origins. Add a suitable response header after checking expected image, embed, and cross-origin use, then test again.

**Status:** Security-hardening warning, with impact dependent on resource use.

## 4. Why does ZAP make the entire CI job red?

**Code involved:**
- [`tests/security/run-zap.sh` lines 29–43](../../../tests/security/run-zap.sh#L29-L43) runs `zap-full-scan.py`, saves `zap-report.json`, then returns the scanner's exit status.
- [`tests/security/zap/rules.conf` lines 1–7](../../../tests/security/zap/rules.conf#L1-L7) explicitly marks four security-header rules as `FAIL`, but does not provide an approved decision for these five warning categories.
- [`.github/workflows/website-ci.yml` lines 120–142](../../../.github/workflows/website-ci.yml#L120-L142) runs ZAP **before** the browser and Node.js 24 checks.

**Plain-English explanation:** ZAP found zero `FAIL` categories but five `WARN` categories and returned **2**. The shell script passed that code back to GitHub Actions, which stopped normal execution of the job. As a result, the following checks were **skipped**, not failed on their own merits.

**Recommended next step:** Fix or validate every finding. Record any justified false positives with evidence and explicit approval in the scanner policy; keep serious findings blocking. To improve visibility, consider running the browser and portability checks in separate jobs that can complete even when ZAP fails. **Do not disable the entire security scan just to get a green badge.**

**Report:** [ZAP JSON artifact for CI #612](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/actions/runs/44657384532/artifacts/14593284380).

## 5. Licence audit — a real failing command, currently hidden by an exception

**Log evidence:** The script found **12 flagged installed entries out of 413** and exited with **1**. These include repeated package/platform variants:

| Packages/family | Licence declaration requiring review |
| --- | --- |
| `@img/sharp-libvips-linux*` | LGPL-3.0-or-later |
| `@img/sharp-wasm32` | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| `lightningcss*` | MPL-2.0 |
| `axe-core` | MPL-2.0 |
| `caniuse-lite` | CC-BY-4.0 |
| `argparse` | Python-2.0 |

**Code to inspect:**
- [`scripts/quality/license-audit.mjs` lines 15–25](../../../scripts/quality/license-audit.mjs#L15-L25) contains the short list of accepted licence IDs.
- [`scripts/quality/license-audit.mjs` lines 95–104](../../../scripts/quality/license-audit.mjs#L95-L104) prints the flagged entries and exits with failure.
- [`.github/workflows/website-ci.yml` lines 65–90](../../../.github/workflows/website-ci.yml#L65-L90) runs the audit with `continue-on-error: true` and emits a warning instead of blocking later steps.

**Plain-English explanation:** A software package's licence describes legal terms for using or distributing it. The package can be technically safe while its licence still needs reviewing. The audit's approved list has not been updated to accept these declarations, so the actual command fails.

**Important distinction:** [Issue #3](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/3) is **closed** and contains an approval comment, but the machine-readable allowlist still flags these packages. The workflow's text saying issue #3 "still requires approval" is therefore out of date. Closure and a general comment do not, by themselves, document which exact package/version, notices and distribution obligations were approved.

**What to do:** Record the exact approved packages/licence obligations and required notices, update the policy or scoped approvals (not a blanket bypass), then re-run the audit. Remove `continue-on-error: true` once the audit actually passes.

**Status:** Failing compliance command, **not itself a reported exploitable security flaw**.

## 6. Dependency vulnerability audit — passed, with an outdated note

The command `npm audit --audit-level=high` reported **"found 0 vulnerabilities"** in CI #612. [Issue #4](https://github.com/RISA-INSTITUTE-WEBSITE/super-duper-spork/issues/4), about an earlier `picomatch` advisory, is recorded as **closed**. Nevertheless, [`.github/workflows/website-ci.yml` lines 65–86](../../../.github/workflows/website-ci.yml#L65-L86) still describes that issue as open and leaves the audit temporarily non-blocking.

**What to do:** Verify the currently committed dependency tree still passes, restore blocking enforcement for the vulnerability audit, and correct the stale issue comments in CI. A clean `npm audit` covers known advisories in the tested dependency tree; it is not proof that the entire website is vulnerability-free.

## 7. Other checks left unverified

- **Playwright end-to-end tests:** [`.github/workflows/website-ci.yml` lines 126–132](../../../.github/workflows/website-ci.yml#L126-L132). They were skipped because ZAP stopped the job first. We do not know their outcome for CI #612.
- **Node.js 24 portability/build:** [`.github/workflows/website-ci.yml` lines 134–146](../../../.github/workflows/website-ci.yml#L134-L146). Also skipped, not passed.
- **Infrastructure-as-code:** [`.github/workflows/website-ci.yml` lines 106–116](../../../.github/workflows/website-ci.yml#L106-L116). No eligible deployment files were found, so no Checkov scan ran. The green step indicates **not applicable**, not a comprehensive infrastructure-security pass.
- **ESLint:** The lint command passed with one `import/no-anonymous-default-export` warning. This is a code-quality warning, **not the reason** the quality gate failed.

## 8. Suggested order of work

1. **Verify the login/registration CSRF alerts**, especially real Server Action and authenticated session behaviour. Fix any demonstrated weakness.
2. **Review CSP and cross-origin resource headers** in `next.config.ts`, tighten them carefully, and test supported external content.
3. **Inspect the flagged Next.js image response** to determine whether rule 43 is a false positive or a genuine information leak.
4. **Re-run local OWASP ZAP**, then document a reason and reviewer for any remaining explicitly accepted scanner warning.
5. **Synchronise licence approvals with the licence-audit script**, including notices and versions, then make the audit blocking again.
6. **Restore blocking dependency vulnerability checks** and remove references to already-closed issues where appropriate.
7. **Run Playwright and Node.js 24 checks**, preferably as independent CI jobs, and verify their actual results.
8. **Re-run the full workflow** and attach the new run, reports, reviewer and resolution date to this README.

### Local reproduction (on a disposable local build — never attack the live website)

```bash
npm ci
npm audit --audit-level=high
node scripts/quality/license-audit.mjs
npm run build
bash tests/security/run-zap.sh
```

The ZAP script starts a local website on port 3000 and runs Docker-based active checks against `127.0.0.1`. It writes `zap-report.json`. Active scanning should not be pointed at the production service or real learner accounts.

## 9. What the findings do **not** mean

- A red CI check **does not prove RISA was hacked**.
- Zero scanner `FAIL` findings **does not certify the website as secure**.
- A closed GitHub issue **does not mean a CI script automatically changed**.
- Green non-blocking audit steps can still contain **real underlying failures**.
- Skipped browser/portability tests **cannot be described as passed**.
- This scan focused on the public local test site. It does **not replace** authenticated role/permission testing, database Row Level Security reviews, private course/quiz access tests, or a qualified security assessment.

**Document status (20 November 2026):** Investigation and recommended checks recorded. No security fix, new penetration test, licence-policy approval or successful rerun is claimed by this README.
