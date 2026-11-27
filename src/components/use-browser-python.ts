"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const executionLimit = 180_000;
const inputLimit = 300_000;
type PythonRun = { type: "run"; id: string; code: string };
type RuntimeMessage = {
  type?: string;
  id?: string;
  detail?: unknown;
  version?: unknown;
  message?: unknown;
  output?: unknown;
  sequence?: unknown;
  startupMs?: unknown;
  legacy?: unknown;
};

type RuntimePhase = "warming" | "ready" | "failed";
const preferenceKey = "risa-python-preferred-runtime";

function prefersCompatibility(): boolean {
  try {
    return localStorage.getItem(preferenceKey) === "compatibility";
  } catch {
    return false;
  }
}

function rememberRuntime(legacy: unknown) {
  try {
    localStorage.setItem(preferenceKey, legacy === true ? "compatibility" : "primary");
  } catch {
    // Storage may be disabled; runtime still works.
  }
}

export function useBrowserPython(frame: RefObject<HTMLIFrameElement | null>) {
  const loaded = useRef(false);
  const active = useRef<PythonRun | null>(null);
  const waiting = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runStarted = useRef(0);
  const [generation, setGeneration] = useState(1);
  const [phase, setPhase] = useState<RuntimePhase>("warming");
  const [startupMs, setStartupMs] = useState<number | null>(null);
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [inputSequence, setInputSequence] = useState<number | null>(null);
  const [version, setVersion] = useState("");

  const cancelTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const finish = useCallback(
    (message: string) => {
      cancelTimer();
      active.current = null;
      waiting.current = null;
      setInputSequence(null);
      setOutput(message);
      setRunning(false);
    },
    [cancelTimer],
  );

  const stop = useCallback(
    (message = "Execution stopped. Python session reset.") => {
      finish(message);
      loaded.current = false;
      setVersion("");
      setPhase("warming");
      setStartupMs(null);
      setLastRunMs(null);
      setGeneration((value) => value + 1);
    },
    [finish],
  );

  const armTimer = useCallback(
    (delay: number) => {
      cancelTimer();
      timer.current = setTimeout(
        () => stop("Execution timed out. Python session reset."),
        delay,
      );
    },
    [cancelTimer, stop],
  );

  useEffect(() => {
    function reportStatus(data: RuntimeMessage) {
      if (typeof data.version === "string") {
        setVersion(data.version.slice(0, 40));
      }
      if (active.current && typeof data.message === "string") {
        setOutput(data.message.slice(0, 200));
      }
    }

    function reportReady(data: RuntimeMessage) {
      setPhase("ready");
      reportStatus(data);
      if (typeof data.startupMs === "number" && Number.isFinite(data.startupMs)) {
        setStartupMs(Math.max(0, Math.round(data.startupMs)));
      }
      rememberRuntime(data.legacy);
    }

    function reportError(data: RuntimeMessage) {
      const detail = typeof data.detail === "string" ? data.detail.slice(0, 1000) : "";
      setPhase("failed");
      setVersion("");
      setStartupMs(null);
      finish("Python runtime failed. " + detail + " Run again to retry.");
    }

    function receiveTerminal(data: RuntimeMessage) {
      if (data.type === "terminal-input" && typeof data.sequence === "number") {
        waiting.current = data.sequence;
        setInputSequence(data.sequence);
        armTimer(inputLimit);
        return;
      }
      if (typeof data.output !== "string") {
        return;
      }
      if (data.type === "terminal-output") {
        setOutput(data.output.slice(0, 20000));
      } else if (data.type === "result") {
        setLastRunMs(Math.max(0, Math.round(performance.now() - runStarted.current)));
        finish(data.output.slice(0, 20100) || "Completed with no output.");
      }
    }

    function receiveRuntime(data: RuntimeMessage) {
      if (data.type === "runtime-error") {
        reportError(data);
      } else if (data.type === "runtime-ready") {
        reportReady(data);
      } else if (data.type === "runtime-status") {
        reportStatus(data);
      } else if (active.current && data.id === active.current.id) {
        receiveTerminal(data);
      }
    }

    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== "null") {
        return;
      }
      const data = event.data as RuntimeMessage | null;
      if (!data) {
        return;
      }
      if (data.type === "frame-ready") {
        loaded.current = true;
        frame.current?.contentWindow?.postMessage(
          { type: "warmup", preferCompatibility: prefersCompatibility() },
          "*",
        );
        if (active.current) {
          frame.current?.contentWindow?.postMessage(active.current, "*");
        }
        return;
      }
      receiveRuntime(data);
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      cancelTimer();
    };
  }, [armTimer, cancelTimer, finish, frame]);

  function run(code: string) {
    if (active.current || code.length > 20000) {
      return;
    }
    const request: PythonRun = { type: "run", id: crypto.randomUUID(), code };
    active.current = request;
    runStarted.current = performance.now();
    setLastRunMs(null);
    setRunning(true);
    if (phase === "failed") {
      setPhase("warming");
    }
    setOutput(phase === "ready" ? "Running Python…" : "Starting Python…");
    armTimer(executionLimit);
    if (loaded.current) {
      frame.current?.contentWindow?.postMessage(request, "*");
    }
  }

  function sendInput(value: string) {
    if (!active.current || waiting.current === null || /[\r\n]/.test(value)) {
      return;
    }
    frame.current?.contentWindow?.postMessage(
      {
        type: "input",
        id: active.current.id,
        sequence: waiting.current,
        value: value.slice(0, 1000),
      },
      "*",
    );
    waiting.current = null;
    setInputSequence(null);
    armTimer(executionLimit);
  }

  return {
    generation,
    output,
    running,
    inputSequence,
    sendInput,
    run,
    stop,
    version,
    phase,
    startupMs,
    lastRunMs,
    clear: () => setOutput(""),
  };
}
