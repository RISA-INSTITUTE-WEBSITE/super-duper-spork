import { describe, expect, it } from "vitest";

import {
  pythonInstallCode,
  pythonInstalledPackagesCode,
  pythonLibraryGroups,
} from "@/lib/risa-python-packages";

describe("Python library manager", () => {
  it("accepts package names without limiting them to the suggestions", () => {
    expect(pythonInstallCode("  numpy  ")).toContain('install("numpy")');
    expect(pythonInstallCode("humanize==4.11.0")).toContain(
      'install("humanize==4.11.0")',
    );
    expect(pythonInstallCode("some-other_package")).toContain(
      'print("Installed: some-other_package")',
    );
  });

  it("rejects URLs, code, empty and oversized requirements", () => {
    for (const input of [
      "",
      "https://example.org/pkg.whl",
      'numpy"); print("hello',
      "numpy; pandas",
      "numpy\npandas",
      "a".repeat(121),
    ]) {
      expect(pythonInstallCode(input)).toBeNull();
    }
  });

  it("offers data science and applied science suggestions and a session listing", () => {
    const packages = pythonLibraryGroups.flatMap((group) => [...group.packages]);
    expect(packages).toEqual(expect.arrayContaining(["numpy", "pandas", "scikit-learn"]));
    expect(pythonInstalledPackagesCode).toContain("micropip.list()");
  });
});
