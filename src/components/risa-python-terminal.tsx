"use client";

import { useEffect, useRef, useState } from "react";

type TerminalProps = {
  output: string;
  running: boolean;
  inputSequence: number | null;
  onInput: (value: string) => void;
  onClear: () => void;
};

function TerminalInput({ onInput }: { onInput: (value: string) => void }) {
  const [value, setValue] = useState("");
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  return (
    <input
      ref={field}
      aria-label="Terminal input"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      enterKeyHint="send"
      maxLength={1000}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onInput(value);
        }
      }}
      className="inline-block w-[min(28ch,100%)] border-b border-[color:var(--ide-focus)] bg-transparent font-mono text-sm text-[color:var(--ide-code)] outline-none"
    />
  );
}

export function PythonTerminal({
  output,
  running,
  inputSequence,
  onInput,
  onClear,
}: TerminalProps) {
  const scroll = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollTop = scroll.current.scrollHeight;
    }
  }, [output, inputSequence]);

  return (
    <section aria-label="Terminal" className="border-t border-[color:var(--ide-border)]">
      <div className="flex items-center justify-between bg-[var(--ide-panel)] px-4 py-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[color:var(--ide-fg)]">
          Terminal
        </h3>
        <button
          type="button"
          disabled={running}
          onClick={onClear}
          className="rounded-md px-2 py-2 text-xs font-medium text-[color:var(--ide-fg)] hover:bg-[var(--ide-hover)] disabled:opacity-50"
        >
          Clear output
        </button>
      </div>
      <pre
        ref={scroll}
        aria-live="polite"
        className="min-h-40 max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-[color:var(--ide-token)]"
      >
        {output || (!running && "Ready. Run your exercise to see the result.")}
        {inputSequence !== null && (
          <TerminalInput key={inputSequence} onInput={onInput} />
        )}
      </pre>
      {inputSequence !== null && (
        <p role="status" className="px-4 pb-3 text-xs text-[color:var(--ide-muted)]">
          Waiting for input — type your response in the terminal and press Enter.
        </p>
      )}
    </section>
  );
}
