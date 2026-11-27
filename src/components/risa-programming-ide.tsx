"use client";

import { useRef, useState } from "react";

import { PythonEditor } from "./risa-python-editor";
import { PythonLibraryManager } from "./risa-python-library-manager";
import { PythonTerminal } from "./risa-python-terminal";
import { useBrowserPython } from "./use-browser-python";

const themes = [
  { id: "dark-plus", label: "Dark+" },
  { id: "light-plus", label: "Light+" },
  { id: "monokai", label: "Monokai" },
  { id: "high-contrast", label: "High Contrast" },
] as const;

type StudioTheme = (typeof themes)[number]["id"];

function ThemeSelector({
  theme,
  onChange,
}: {
  theme: StudioTheme;
  onChange: (theme: StudioTheme) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold">
      Theme
      <select
        aria-label="Color theme"
        value={theme}
        onChange={(event) => {
          const selected = themes.find((item) => item.id === event.target.value);
          if (selected) {
            onChange(selected.id);
          }
        }}
        className="min-h-10 rounded-md border border-[color:var(--ide-border)] bg-[var(--ide-editor)] px-2 text-[color:var(--ide-fg)]"
      >
        {themes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type ProgrammingIDEProps = {
  source: string;
  onSourceChange: (value: string) => void;
  onReset: () => void;
};

export function ProgrammingIDE({ source, onSourceChange, onReset }: ProgrammingIDEProps) {
  const [theme, setTheme] = useState<StudioTheme>("dark-plus");
  const frame = useRef<HTMLIFrameElement>(null);
  const python = useBrowserPython(frame);
  return (
    <div
      data-theme={theme}
      className="risa-programming-ide mt-6 overflow-hidden rounded-2xl border border-[color:var(--ide-border)] bg-[var(--ide-editor)] text-[color:var(--ide-fg)] shadow-xl"
    >
      {python.generation > 0 && (
        <iframe
          key={python.generation}
          ref={frame}
          src="/python-sandbox.html"
          sandbox="allow-scripts"
          title="Isolated Python runtime"
          onLoad={python.frameLoaded}
          hidden
        />
      )}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--ide-border)] bg-[var(--ide-panel)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ide-hover)] font-mono text-lg font-bold text-[color:var(--ide-token)]">
            &lt;/&gt;
          </span>
          <div>
            <h2 className="text-base font-bold">RISA Programming Studio</h2>
            <p className="text-xs text-[color:var(--ide-muted)]">
              General-purpose Python workspace
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeSelector theme={theme} onChange={setTheme} />
          <button
            type="button"
            disabled={python.running}
            onClick={() => python.run(source)}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ide-accent)] px-4 py-2 text-sm font-bold text-[color:var(--ide-button-fg)] hover:bg-[var(--ide-button-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ide-focus)] disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4"
              fill="currentColor"
            >
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
            Run
          </button>
          <button
            type="button"
            disabled={!python.running}
            onClick={() => python.stop()}
            className="min-h-11 rounded-lg border border-[color:var(--ide-border)] px-3 text-sm font-bold disabled:opacity-50"
          >
            Stop
          </button>
        </div>
      </header>
      <div className="grid min-w-0 lg:grid-cols-[208px_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--ide-border)] bg-[var(--ide-sidebar)] p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-sm font-bold text-[color:var(--ide-fg)]">
            Libraries &amp; environment
          </h3>
          <p className="mt-5 text-xs leading-5 text-[color:var(--ide-muted)]">
            Import supported libraries directly. For compatible PyPI packages, use import
            micropip and await micropip.install(...). Do not enter secrets.
          </p>
          <PythonLibraryManager running={python.running} onExecute={python.run} />
        </aside>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-[color:var(--ide-border)] bg-[var(--ide-panel)]">
            <div className="flex items-center gap-2 border-t-2 border-[color:var(--ide-accent)] bg-[var(--ide-editor)] px-4 py-3 font-mono text-xs">
              <span className="font-bold text-[color:var(--ide-token)]">PY</span>
              main.py
            </div>
            <button
              type="button"
              onClick={() => {
                onReset();
                python.stop("");
              }}
              className="mr-3 rounded-md px-3 py-2 text-xs font-semibold text-[color:var(--ide-fg)] hover:bg-[var(--ide-hover)]"
            >
              Reset
            </button>
          </div>
          <PythonEditor
            source={source}
            onSourceChange={onSourceChange}
            onRun={() => python.run(source)}
          />
          <PythonTerminal
            output={python.output}
            running={python.running}
            inputSequence={python.inputSequence}
            onInput={python.sendInput}
            onClear={python.clear}
          />
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--ide-border)] bg-[var(--ide-panel)] px-4 py-2 text-[11px] text-[color:var(--ide-muted)]">
        <span>
          {python.version ? "Pyodide " + python.version : "Python"} · Browser runtime ·
          Isolated session
        </span>
        <span role="status" aria-label="Python runtime status">
          {python.phase === "ready"
            ? "Python ready"
            : python.phase === "failed"
              ? "Python unavailable"
              : "Starting Python…"}
          {python.startupMs !== null && " · Startup " + python.startupMs + " ms"}
          {python.lastRunMs !== null && " · Last run " + python.lastRunMs + " ms"}
        </span>
        <span>{source.length}/20,000 characters · Ctrl/⌘ + Enter to run</span>
      </footer>
    </div>
  );
}

/** A module-independent studio. Each mount owns its code and isolated runtime. */
export function PythonStudio({ initialCode = "" }: { initialCode?: string }) {
  const [source, setSource] = useState(initialCode);

  return (
    <ProgrammingIDE
      source={source}
      onSourceChange={setSource}
      onReset={() => setSource(initialCode)}
    />
  );
}
