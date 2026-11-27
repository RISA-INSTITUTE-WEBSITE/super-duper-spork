"use client";

import { useMemo, useRef } from "react";

import { highlightPython } from "@/lib/risa-python-highlight";

type PythonEditorProps = {
  source: string;
  onSourceChange: (value: string) => void;
  onRun: () => void;
};

export function PythonEditor({ source, onSourceChange, onRun }: PythonEditorProps) {
  const gutter = useRef<HTMLDivElement>(null);
  const highlight = useRef<HTMLDivElement>(null);
  const tokens = useMemo(() => highlightPython(source), [source]);
  const lineCount = Math.max(12, source.split("\n").length);

  return (
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
      <div className="risa-python-editor relative h-72 min-w-0 flex-1 sm:h-80">
        <div
          aria-hidden="true"
          ref={highlight}
          className="risa-python-highlight risa-python-editor-layer absolute inset-0"
        >
          {tokens.map((token, index) => (
            <span key={index} data-python-token={token.kind}>
              {token.text}
            </span>
          ))}
          {"\n"}
        </div>
        <textarea
          aria-label="Editor"
          placeholder="Write or paste Python code here, then select Run exercise."
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
          onScroll={(event) => {
            const { scrollTop, scrollLeft } = event.currentTarget;
            if (gutter.current) {
              gutter.current.scrollTop = scrollTop;
            }
            if (highlight.current) {
              highlight.current.scrollTop = scrollTop;
              highlight.current.scrollLeft = scrollLeft;
            }
          }}
          onKeyDown={(event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
              event.preventDefault();
              onRun();
            }
          }}
          maxLength={20000}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          wrap="off"
          className="risa-python-editor-input risa-python-editor-layer absolute inset-0 h-full w-full resize-none focus:outline-2 focus:outline-inset focus:outline-[var(--ide-focus)]"
        />
      </div>
    </div>
  );
}
