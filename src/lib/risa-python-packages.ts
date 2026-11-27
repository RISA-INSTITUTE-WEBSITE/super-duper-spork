export const pythonLibraryGroups = [
  {
    name: "Data science",
    packages: ["numpy", "pandas", "polars", "pyarrow", "xarray", "openpyxl"],
  },
  {
    name: "Machine learning",
    packages: ["scikit-learn", "xgboost", "lightgbm", "joblib"],
  },
  {
    name: "Mathematics and statistics",
    packages: ["scipy", "sympy", "statsmodels", "mpmath", "patsy"],
  },
  {
    name: "Visualization",
    packages: ["matplotlib", "seaborn", "plotly", "altair", "bokeh"],
  },
  {
    name: "Applied sciences",
    packages: [
      "astropy",
      "biopython",
      "geopandas",
      "shapely",
      "networkx",
      "scikit-image",
      "opencv-python",
      "pillow",
      "h5py",
    ],
  },
] as const;

// Package names and optional exact versions only. URLs, shell commands,
// environment markers and alternate indexes are not accepted by this UI.
const requirementPattern =
  /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?(?:==[0-9][a-z0-9._+!-]*)?$/i;

export function pythonInstallCode(input: string): string | null {
  const requirement = input.trim();
  if (requirement.length > 120 || !requirementPattern.test(requirement)) {
    return null;
  }
  return [
    "import micropip as _risa_micropip",
    "await _risa_micropip.install(" + JSON.stringify(requirement) + ")",
    "print(" + JSON.stringify("Installed: " + requirement) + ")",
  ].join("\n");
}

export const pythonInstalledPackagesCode =
  "import micropip as _risa_micropip\nprint(_risa_micropip.list())";
