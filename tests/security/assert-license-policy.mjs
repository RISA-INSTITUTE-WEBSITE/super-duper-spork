import assert from "node:assert/strict";

import {
  isLicenseApproved,
  isReviewedException,
} from "../../scripts/quality/license-policy.mjs";

const cases = [
  ["@img/sharp-libvips-linux-x64", "1.3.4", "LGPL-3.0-or-later"],
  ["@img/sharp-libvips-linuxmusl-x64", "1.3.4", "LGPL-3.0-or-later"],
  ["@img/sharp-wasm32", "0.35.5", "Apache-2.0 AND LGPL-3.0-or-later AND MIT"],
  ["argparse", "2.0.1", "Python-2.0"],
  ["axe-core", "4.14.1", "MPL-2.0"],
  ["caniuse-lite", "1.0.30001826", "CC-BY-4.0"],
  ["lightningcss", "1.32.0", "MPL-2.0"],
  ["lightningcss", "1.33.0", "MPL-2.0"],
  ["lightningcss-linux-x64-gnu", "1.32.0", "MPL-2.0"],
  ["lightningcss-linux-x64-gnu", "1.33.0", "MPL-2.0"],
  ["lightningcss-linux-x64-musl", "1.32.0", "MPL-2.0"],
  ["lightningcss-linux-x64-musl", "1.33.0", "MPL-2.0"],
];

for (const [name, version, license] of cases) {
  const reviewed = { name, version, license };
  assert.equal(isReviewedException(reviewed), true, name + " should match its review");
  assert.equal(isLicenseApproved(reviewed), true, name + " should pass the audit");
  assert.equal(
    isLicenseApproved({ name: "unreviewed-package", version, license }),
    false,
    "Non-reviewed package must not inherit a licence exception",
  );
  assert.equal(
    isLicenseApproved({ name, version: "99.99.99", license }),
    false,
    "A new version needs fresh review",
  );
  assert.equal(
    isLicenseApproved({ name, version, license: license + " OR GPL-3.0-only" }),
    false,
    "A changed SPDX declaration needs fresh review",
  );
}

assert.equal(
  isLicenseApproved({ name: "example", version: "1.0.0", license: "MIT" }),
  true,
);
assert.equal(
  isLicenseApproved({
    name: "example",
    version: "1.0.0",
    license: "MIT OR Apache-2.0",
  }),
  true,
);
assert.equal(
  isLicenseApproved({ name: "example", version: "1.0.0", license: "" }),
  false,
);
assert.equal(isLicenseApproved({ name: "example", version: "1.0.0" }), false);
assert.equal(
  isLicenseApproved({
    name: "example",
    version: "1.0.0",
    license: "GPL-3.0-only",
  }),
  false,
);

process.stdout.write("Exact third-party licence approval regression tests passed.\n");
