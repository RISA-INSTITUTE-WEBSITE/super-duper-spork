import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const allowedLicenseIds = new Set([
  "MIT",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "CC0-1.0",
  "Unlicense",
  "BlueOak-1.0.0",
]);

const allowedOperators = new Set(["OR", "AND", "WITH"]);
const nodeModules = path.resolve("node_modules");
const errors = [];
let checked = 0;

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

    const identifiers = license.match(/[A-Za-z0-9][A-Za-z0-9.+-]*/g) ?? [];
    const rejected = identifiers.filter(
      (identifier) =>
        !allowedLicenseIds.has(identifier) && !allowedOperators.has(identifier),
    );
    if (rejected.length > 0) {
      errors.push(`${packageName}: review license "${license}"`);
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

process.stdout.write(`License audit passed: ${checked} packages have approved SPDX licenses.\n`);
