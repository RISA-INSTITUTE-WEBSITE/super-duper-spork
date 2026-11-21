/**
 * QA-SEC-03 — dependency license compliance gate.
 *
 * Walks installed node_modules manifests, checks declared SPDX identifiers
 * against RISA's initial allowlist, and exits non-zero for any unreviewed
 * license or unreadable manifest. It makes no legal determination: flagged
 * licenses require an explicit human compliance decision (issue #3).
 *
 * This script is deliberately fail-closed; do not turn unknown licenses into
 * silent warnings just to make the CI green.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { isLicenseApproved, isReviewedException } from "./license-policy.mjs";
const nodeModules = path.resolve("node_modules");
const errors = [];
let checked = 0;
let reviewedCount = 0;

async function inspectPackage(directory) {
  const manifestPath = path.join(directory, "package.json");

  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const license = typeof manifest.license === "string" ? manifest.license : undefined;
    const packageName = manifest.name ?? directory;
    checked += 1;

    if (!license) {
      errors.push(`${packageName}: missing declared SPDX license`);
      return;
    }

    if (!isLicenseApproved({ name: packageName, version: manifest.version, license })) {
      errors.push(
        `${packageName}@${manifest.version ?? "unknown"}: review license "${license}"`,
      );
    } else if (isReviewedException({ name: packageName, version: manifest.version, license })) {
      reviewedCount += 1;
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      errors.push(`${directory}: cannot read package metadata (${error.message})`);
    }
  }
}

async function walkNodeModules(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (entry.name.startsWith(".")) {
      continue;
    }

    const absolute = path.join(directory, entry.name);
    if (entry.name.startsWith("@")) {
      await walkNodeModules(absolute);
    } else {
      await inspectPackage(absolute);
      await walkNodeModules(path.join(absolute, "node_modules"));
    }
  }
}

await walkNodeModules(nodeModules);
if (checked === 0) {
  console.error("License audit failed: no installed packages found.");
  process.exit(1);
}

if (errors.length > 0) {
  console.error(`License audit flagged ${errors.length} / ${checked} packages:`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error("Review and approve exception requests; do not disable this gate.");
  process.exit(1);
}

process.stdout.write(
  `License audit passed: ${checked} packages assessed (${reviewedCount} exact reviewed exceptions).\n`,
);
