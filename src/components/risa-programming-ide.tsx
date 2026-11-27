"use client";

import { useRef, useState } from "react";

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

const examples = [
  { label: "Area of a rectangle", code: "print(8 * 5)" },
  { label: "Addition", code: "print(12 + 7)" },
  { label: "Division", code: "print(24 / 6)" },
];

type ProgrammingIDEProps = {
  source: string;
  output: string;
  onSourceChange: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  onClear: () => void;
};

export function ProgrammingIDE({
  source,
  output,
  onSourceChange,
  onRun,
  onReset,
  onClear,
}: ProgrammingIDEProps) {
  const [theme, setTheme] = useState<StudioTheme>("dark-plus");
  const gutter = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(12, source.split("\n").length);
  return (
    <div
      data-theme={theme}
      className="risa-programming-ide mt-6 overflow-hidden rounded-2xl border border-[color:var(--ide-border)] bg-[var(--ide-editor)] text-[color:var(--ide-fg)] shadow-xl"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--ide-border)] bg-[var(--ide-panel)] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--ide-hover)] font-mono text-lg font-bold text-[color:var(--ide-token)]">
            &lt;/&gt;
          </span>
          <div>
            <h2 className="text-base font-bold">RISA Programming Studio</h2>
            <p className="text-xs text-[color:var(--ide-muted)]">
              CS102 · Programming fundamentals
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ThemeSelector theme={theme} onChange={setTheme} />
          <button
            type="button"
            onClick={onRun}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--ide-accent)] px-4 py-2 text-sm font-bold text-[color:var(--ide-button-fg)] hover:bg-[var(--ide-button-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ide-focus)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4"
              fill="currentColor"
            >
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
            Run exercise
          </button>
        </div>
      </header>
      <div className="grid min-w-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--ide-border)] bg-[var(--ide-sidebar)] p-4 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[color:var(--ide-muted)]">
            Exercise 01
          </p>
          <h3 className="mt-3 text-sm font-bold text-[color:var(--ide-fg)]">
            Arithmetic operations
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--ide-fg)]">
            Calculate the area of a rectangle. Change the two dimensions and run the
            expression again.
          </p>
          <div className="mt-5 rounded-lg border border-[color:var(--ide-border)] bg-[var(--ide-editor)] p-3">
            <p className="text-xs font-bold text-[color:var(--ide-token)]">
              Your challenge
            </p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--ide-fg)]">
              Find the area of a rectangle measuring 12 m by 9 m.
            </p>
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-[color:var(--ide-muted)]">
            Starter examples
          </p>
          <div className="mt-2 grid gap-2">
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => onSourceChange(example.code)}
                className="rounded-lg border border-[color:var(--ide-border)] px-3 py-2 text-left text-xs font-medium text-[color:var(--ide-fg)] hover:border-[color:var(--ide-focus)] hover:bg-[var(--ide-hover)]"
              >
                {example.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-[color:var(--ide-border)] bg-[var(--ide-panel)]">
            <div className="flex items-center gap-2 border-t-2 border-[color:var(--ide-accent)] bg-[var(--ide-editor)] px-4 py-3 font-mono text-xs">
              <span className="font-bold text-[color:var(--ide-token)]">PY</span>
              main.py
            </div>
            <button
              type="button"
              onClick={onReset}
              className="mr-3 rounded-md px-3 py-2 text-xs font-semibold text-[color:var(--ide-fg)] hover:bg-[var(--ide-hover)]"
            >
              Reset
            </button>
          </div>
          <div className="flex min-w-0">
            <div
              aria-hidden="true"
              ref={gutter}
              className="h-72 w-11 shrink-0 overflow-hidden border-r border-[color:var(--ide-border)] py-4 text-right font-mono text-sm leading-6 text-[color:var(--ide-muted)] sm:h-80"
            >
              {Array.from({ length: lineCount }, (_, index) => (
                <div key={index} className="pr-3">
                  {index + 1}
                </div>
              ))}
            </div>
            <textarea
              aria-label="Editor"
              value={source}
              onChange={(event) => onSourceChange(event.target.value)}
              onScroll={(event) => {
                if (gutter.current) {
                  gutter.current.scrollTop = event.currentTarget.scrollTop;
                }
              }}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  onRun();
                }
              }}
              maxLength={2000}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              wrap="off"
              className="h-72 min-w-0 flex-1 resize-none overflow-auto bg-[var(--ide-editor)] p-4 font-mono text-sm leading-6 text-[color:var(--ide-code)] caret-[var(--ide-code)] focus:outline-2 focus:outline-inset focus:outline-[var(--ide-focus)] sm:h-80"
            />
          </div>
          <section
            aria-label="Console"
            className="border-t border-[color:var(--ide-border)]"
          >
            <div className="flex items-center justify-between bg-[var(--ide-panel)] px-4 py-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[color:var(--ide-fg)]">
                Output console
              </h3>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-2 py-2 text-xs font-medium text-[color:var(--ide-fg)] hover:bg-[var(--ide-hover)]"
              >
                Clear output
              </button>
            </div>
            <pre
              aria-live="polite"
              className="min-h-28 max-h-48 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-[color:var(--ide-token)]"
            >
              {output || "Ready. Run your exercise to see the result."}
            </pre>
          </section>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[color:var(--ide-border)] bg-[var(--ide-panel)] px-4 py-2 text-[11px] text-[color:var(--ide-muted)]">
        <span>Python-style arithmetic simulator · No external execution</span>
        <span>{source.length}/2,000 characters · Ctrl/⌘ + Enter to run</span>
      </footer>
    </div>
  );
}
