"use client";

import { useRef } from "react";

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
  const gutter = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(12, source.split("\n").length);
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-[#253247] bg-[#0b1220] text-slate-100 shadow-xl">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#293649] bg-[#111b2c] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#78eb29]/15 font-mono text-lg font-bold text-[#a6f66d]">
            &lt;/&gt;
          </span>
          <div>
            <h2 className="text-base font-bold">RISA Programming Studio</h2>
            <p className="text-xs text-slate-400">CS102 · Programming fundamentals</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRun}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#78eb29] px-4 py-2 text-sm font-bold text-[#122608] hover:bg-[#a6f66d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
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
      </header>
      <div className="grid min-w-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-[#293649] bg-[#101a2a] p-4 lg:border-b-0 lg:border-r">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Exercise 01
          </p>
          <h3 className="mt-3 text-sm font-bold text-white">Arithmetic operations</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Calculate the area of a rectangle. Change the two dimensions and run the
            expression again.
          </p>
          <div className="mt-5 rounded-lg border border-[#293649] bg-[#0b1220] p-3">
            <p className="text-xs font-bold text-[#a6f66d]">Your challenge</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Find the area of a rectangle measuring 12 m by 9 m.
            </p>
          </div>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Starter examples
          </p>
          <div className="mt-2 grid gap-2">
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => onSourceChange(example.code)}
                className="rounded-lg border border-[#293649] px-3 py-2 text-left text-xs font-medium text-slate-200 hover:border-[#78eb29] hover:bg-[#78eb29]/10"
              >
                {example.label}
              </button>
            ))}
          </div>
        </aside>
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-[#293649] bg-[#111b2c]">
            <div className="flex items-center gap-2 border-t-2 border-[#78eb29] bg-[#0b1220] px-4 py-3 font-mono text-xs">
              <span className="font-bold text-[#a6f66d]">PY</span>
              main.py
            </div>
            <button
              type="button"
              onClick={onReset}
              className="mr-3 rounded-md px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Reset
            </button>
          </div>
          <div className="flex min-w-0">
            <div
              aria-hidden="true"
              ref={gutter}
              className="h-72 w-11 shrink-0 overflow-hidden border-r border-[#1c293d] py-4 text-right font-mono text-sm leading-6 text-slate-500 sm:h-80"
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
              className="h-72 min-w-0 flex-1 resize-none overflow-auto bg-[#0b1220] p-4 font-mono text-sm leading-6 text-[#d4e6ff] caret-[#78eb29] focus:outline-2 focus:outline-inset focus:outline-[#78eb29] sm:h-80"
            />
          </div>
          <section aria-label="Console" className="border-t border-[#293649]">
            <div className="flex items-center justify-between bg-[#111b2c] px-4 py-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-300">
                Output console
              </h3>
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-2 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Clear output
              </button>
            </div>
            <pre
              aria-live="polite"
              className="min-h-28 max-h-48 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-[#a6f66d]"
            >
              {output || "Ready. Run your exercise to see the result."}
            </pre>
          </section>
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#293649] bg-[#111b2c] px-4 py-2 text-[11px] text-slate-400">
        <span>Python-style arithmetic simulator · No external execution</span>
        <span>{source.length}/2,000 characters · Ctrl/⌘ + Enter to run</span>
      </footer>
    </div>
  );
}
