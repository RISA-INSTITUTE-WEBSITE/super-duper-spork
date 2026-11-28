"use client";

import { useRef, useState } from "react";

import {
  endLinuxSession,
  runLinuxCommand,
  startLinuxSession,
} from "@/app/workspace/linux-actions";

function formatCommandResult(
  result: Awaited<ReturnType<typeof runLinuxCommand>>,
): string {
  if ("error" in result) {
    return result.error + "\n";
  }
  const output = result.output;
  return (
    output +
    (output && !output.endsWith("\n") ? "\n" : "") +
    (result.exitCode === 0 ? "" : "[Exit " + result.exitCode + "]\n")
  );
}

export function LinuxTerminal() {
  const [session, setSession] = useState("");
  const [command, setCommand] = useState("");
  const [transcript, setTranscript] = useState("Start an isolated Linux session.");
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const consoleRef = useRef<HTMLPreElement>(null);

  function append(value: string) {
    setTranscript((old) => (old + value).slice(-80_000));
    requestAnimationFrame(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    });
  }

  async function start() {
    setBusy(true);
    setTranscript("Starting Linux sandbox…");
    try {
      const result = await startLinuxSession();
      if (result.session) {
        setSession(result.session);
        setHistory([]);
        setPosition(0);
        setTranscript(
          "Linux ready. Type a Bash command. Session expires after 5 minutes.",
        );
      } else {
        setTranscript(result.error ?? "Unable to start Linux.");
      }
    } catch {
      setTranscript(
        "Unable to start Linux. Check your connection and administrator session.",
      );
    } finally {
      setBusy(false);
      requestAnimationFrame(() => input.current?.focus());
    }
  }

  async function stop() {
    setBusy(true);
    try {
      const result = await endLinuxSession(session);
      append("\n" + (result.stopped ? "Session ended." : result.error));
    } catch {
      append("\nShutdown not confirmed; the sandbox expires automatically.");
    } finally {
      setSession("");
      setCommand("");
      setBusy(false);
    }
  }

  async function submit() {
    const value = command.trim();
    if (!value || busy || !session) {
      return;
    }
    setHistory((old) => [...old.slice(-99), value]);
    setPosition(0);
    setCommand("");
    if (value === "clear") {
      setTranscript("");
      return;
    }
    if (value === "exit") {
      await stop();
      return;
    }
    setBusy(true);
    append("\n$ " + value + "\n");
    try {
      const result = await runLinuxCommand(session, value);
      append(formatCommandResult(result));
    } catch {
      append("Command request failed. Check your connection.\n");
    } finally {
      setBusy(false);
      requestAnimationFrame(() => input.current?.focus());
    }
  }

  return (
    <section
      aria-label="Linux Terminal"
      className="mt-6 overflow-hidden rounded-xl bg-slate-950 text-slate-100"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-700 px-4 py-3">
        <h2 className="mr-auto text-lg font-bold">Linux Terminal</h2>
        <button
          type="button"
          disabled={busy || !!session}
          onClick={start}
          className="rounded-md bg-green-700 px-3 py-2 text-sm font-bold disabled:opacity-50"
        >
          Start session
        </button>
        <button
          type="button"
          disabled={busy || !session}
          onClick={stop}
          className="rounded-md border border-slate-500 px-3 py-2 text-sm disabled:opacity-50"
        >
          End session
        </button>
        <button
          type="button"
          onClick={() => setTranscript("")}
          className="rounded-md border border-slate-500 px-3 py-2 text-sm"
        >
          Clear output
        </button>
      </div>
      <pre
        ref={consoleRef}
        aria-live="polite"
        className="h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-sm text-green-200"
      >
        {transcript}
      </pre>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        className="flex items-center gap-2 border-t border-slate-700 px-4 py-3 font-mono text-sm"
      >
        <span className="text-green-300">$</span>
        <input
          ref={input}
          aria-label="Linux command"
          value={command}
          disabled={busy || !session}
          maxLength={4000}
          spellCheck={false}
          autoComplete="off"
          placeholder={busy ? "Working…" : "Enter a command"}
          onChange={(event) => {
            setCommand(event.target.value);
            setPosition(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              const next = Math.max(
                0,
                Math.min(history.length, position + (event.key === "ArrowUp" ? 1 : -1)),
              );
              setPosition(next);
              setCommand(next ? history[history.length - next] : "");
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-white outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || !session || !command.trim()}
          className="rounded-md bg-slate-700 px-3 py-2 disabled:opacity-50"
        >
          Run
        </button>
      </form>
      <p role="status" className="px-4 pb-3 text-xs text-slate-400">
        {busy ? "Working…" : session ? "Session active" : "Session stopped"} · Isolated
        Linux · Network disabled · Non-interactive commands
      </p>
    </section>
  );
}
