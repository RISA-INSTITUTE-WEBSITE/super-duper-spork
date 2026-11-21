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

// Name, version and the complete SPDX expression must match exactly.
// These are the twelve installed entries from the approved lockfile review.
const reviewed = [
  {
    name: "@img/sharp-libvips-linux-x64",
    version: "1.3.4",
    license: "LGPL-3.0-or-later",
  },
  {
    name: "@img/sharp-libvips-linuxmusl-x64",
    version: "1.3.4",
    license: "LGPL-3.0-or-later",
  },
  {
    name: "@img/sharp-wasm32",
    version: "0.35.5",
    license: "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
  },
  {
    name: "argparse",
    version: "2.0.1",
    license: "Python-2.0",
  },
  {
    name: "axe-core",
    version: "4.14.1",
    license: "MPL-2.0",
  },
  {
    name: "caniuse-lite",
    version: "1.0.30001826",
    license: "CC-BY-4.0",
  },
  {
    name: "lightningcss",
    version: "1.32.0",
    license: "MPL-2.0",
  },
  {
    name: "lightningcss",
    version: "1.33.0",
    license: "MPL-2.0",
  },
  {
    name: "lightningcss-linux-x64-gnu",
    version: "1.32.0",
    license: "MPL-2.0",
  },
  {
    name: "lightningcss-linux-x64-gnu",
    version: "1.33.0",
    license: "MPL-2.0",
  },
  {
    name: "lightningcss-linux-x64-musl",
    version: "1.32.0",
    license: "MPL-2.0",
  },
  {
    name: "lightningcss-linux-x64-musl",
    version: "1.33.0",
    license: "MPL-2.0",
  },
];

export function isReviewedException({ name, version, license }) {
  return reviewed.some(
    (entry) =>
      entry.name === name && entry.version === version && entry.license === license,
  );
}

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

  return isReviewedException({ name, version, license });
}
