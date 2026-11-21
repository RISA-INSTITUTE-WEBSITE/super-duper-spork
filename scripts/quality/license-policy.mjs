/**
 * Exact dependency-license exceptions recorded in RISA issue #3.
 *
 * An owner approval comment does not waive LGPL/MPL/attribution obligations:
 * see docs/compliance/THIRD-PARTY-APPROVALS.md. A new package, version, or
 * SPDX expression must be reviewed rather than silently added here.
 */
const initialSpdxIds = new Set([
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

const spdxOperators = new Set(["AND", "OR", "WITH"]);

// Name + exact version + full SPDX expression are all mandatory.
// Versions are taken from the committed package-lock.json used by CI.
// Duplicate nested platform entries with the same name/version are expected.
const reviewed = new Map([
  ["@img/sharp-libvips-linux-x64", { versions: ["1.3.4"], license: "LGPL-3.0-or-later" }],
  ["@img/sharp-libvips-linuxmusl-x64", { versions: ["1.3.4"], license: "LGPL-3.0-or-later" }],
  ["@img/sharp-wasm32", {
    versions: ["0.35.5"],
    license: "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
  }],
  ["argparse", { versions: ["2.0.1"], license: "Python-2.0" }],
  ["axe-core", { versions: ["4.14.1"], license: "MPL-2.0" }],
  ["caniuse-lite", { versions: ["1.0.30001826"], license: "CC-BY-4.0" }],
  ["lightningcss", { versions: ["1.32.0", "1.33.0"], license: "MPL-2.0" }],
  ["lightningcss-linux-x64-gnu", {
    versions: ["1.32.0", "1.33.0"],
    license: "MPL-2.0",
  }],
  ["lightningcss-linux-x64-musl", {
    versions: ["1.32.0", "1.33.0"],
    license: "MPL-2.0",
  }],
]);

export function isLicenseApproved({ name, version, license }) {
  if (typeof license !== "string" || !license.trim()) {
    return false;
  }

  const tokens = license.match(/[A-Za-z0-9][A-Za-z0-9.+-]*/g) ?? [];
  if (
    tokens.length > 0 &&
    tokens.every((token) => initialSpdxIds.has(token) || spdxOperators.has(token))
  ) {
    return true;
  }

  const decision = reviewed.get(name);
  return Boolean(
    decision &&
      decision.license === license &&
      typeof version === "string" &&
      decision.versions.includes(version),
  );
}

export function isReviewedException({ name, version, license }) {
  const decision = reviewed.get(name);
  return Boolean(
    decision &&
      decision.license === license &&
      typeof version === "string" &&
      decision.versions.includes(version),
  );
}
