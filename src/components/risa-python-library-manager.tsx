"use client";

import { useState } from "react";

import {
  pythonInstallCode,
  pythonInstalledPackagesCode,
  pythonLibraryGroups,
} from "@/lib/risa-python-packages";

export function PythonLibraryManager({
  running,
  onExecute,
}: {
  running: boolean;
  onExecute: (code: string) => void;
}) {
  const [requirement, setRequirement] = useState("numpy");
  const code = pythonInstallCode(requirement);

  return (
    <details className="mt-5 rounded-lg border border-[color:var(--ide-border)] p-3">
      <summary className="cursor-pointer text-sm font-bold text-[color:var(--ide-fg)]">
        Python libraries
      </summary>
      <p className="mt-3 text-xs leading-5 text-[color:var(--ide-muted)]">
        Install compatible packages on demand in this browser session. The catalogue is
        a set of suggestions, not a restriction.
      </p>
      <label className="mt-3 block text-xs font-semibold">
        Suggested library
        <select
          aria-label="Suggested library"
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          disabled={running}
          className="mt-1 w-full rounded border border-[color:var(--ide-border)] bg-[var(--ide-editor)] p-2 text-[color:var(--ide-fg)]"
        >
          <option value={requirement} hidden>
            {requirement || "Choose a library"}
          </option>
          {pythonLibraryGroups.map((group) => (
            <optgroup key={group.name} label={group.name}>
              {group.packages.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>
      <label className="mt-3 block text-xs font-semibold">
        Package name or exact version
        <input
          value={requirement}
          onChange={(event) => setRequirement(event.target.value)}
          maxLength={120}
          disabled={running}
          spellCheck={false}
          placeholder="e.g. seaborn"
          className="mt-1 w-full rounded border border-[color:var(--ide-border)] bg-[var(--ide-editor)] p-2 font-mono"
        />
      </label>
      {requirement.trim() && !code && (
        <p role="status" className="mt-2 text-xs">
          Enter a package name, optionally followed by ==version.
        </p>
      )}
      <button
        type="button"
        disabled={running || !code}
        onClick={() => {
          if (code) {
            onExecute(code);
          }
        }}
        className="mt-3 w-full rounded-md bg-[var(--ide-accent)] px-3 py-2 text-xs font-bold text-[color:var(--ide-button-fg)] disabled:opacity-50"
      >
        Install library
      </button>
      <button
        type="button"
        disabled={running}
        onClick={() => onExecute(pythonInstalledPackagesCode)}
        className="mt-2 w-full rounded-md border border-[color:var(--ide-border)] px-3 py-2 text-xs font-semibold disabled:opacity-50"
      >
        List installed libraries
      </button>
      <p className="mt-3 text-xs leading-5 text-[color:var(--ide-muted)]">
        Results appear in the console without replacing your code. Reset or Stop discards
        installed libraries. Some packages require native Python or a GPU. Plot rendering
        is not yet available. Install only packages you trust.
      </p>
    </details>
  );
}
