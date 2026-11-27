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
};

export function useBrowserPython(frame: RefObject<HTMLIFrameElement | null>) {
  const loaded = useRef(false);
  const active = useRef<PythonRun | null>(null);
  const waiting = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [generation, setGeneration] = useState(0);
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
      if (typeof data.message === "string") {
        setOutput(data.message.slice(0, 200));
      }
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
        finish(data.output.slice(0, 20100) || "Completed with no output.");
      }
    }

    function receiveRunMessage(data: RuntimeMessage, request: PythonRun) {
      if (data.type === "runtime-error") {
        const detail = typeof data.detail === "string" ? data.detail.slice(0, 1000) : "";
        stop("Python runtime failed. " + detail);
      } else if (data.type === "runtime-status") {
        reportStatus(data);
      } else if (data.id === request.id) {
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
        if (active.current) {
          frame.current?.contentWindow?.postMessage(active.current, "*");
        }
        return;
      }
      if (active.current) {
        receiveRunMessage(data, active.current);
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      cancelTimer();
    };
  }, [armTimer, cancelTimer, finish, frame, stop]);

  function run(code: string) {
    if (active.current || code.length > 20000) {
      return;
    }
    const request: PythonRun = { type: "run", id: crypto.randomUUID(), code };
    active.current = request;
    setRunning(true);
    setOutput("Loading Python or running your code…");
    armTimer(executionLimit);
    if (generation === 0) {
      setGeneration(1);
    } else if (loaded.current) {
      frame.current?.contentWindow?.postMessage(request, "*");
    }
  }

  function sendInput(value: string) {
    if (!active.current || waiting.current === null || /[\r\n]/.test(value)) {
      return;
    }
    frame.current?.contentWindow?.postMessage(
      { type: "input", id: active.current.id, sequence: waiting.current, value: value.slice(0, 1000) },
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
    clear: () => setOutput(""),
  };
}
