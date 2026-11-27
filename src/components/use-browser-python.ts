"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

const executionLimit = 120_000;
type PythonRun = { type: "run"; id: string; code: string; stdin: string };

function pythonResult(data: unknown, id: string): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const message = data as { type?: unknown; id?: unknown; output?: unknown };
  if (
    message.type !== "result" ||
    message.id !== id ||
    typeof message.output !== "string"
  ) {
    return null;
  }
  return message.output.slice(0, 20100) || "Completed with no output.";
}

export function useBrowserPython(frame: RefObject<HTMLIFrameElement | null>) {
  const loaded = useRef(false);
  const active = useRef<PythonRun | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [generation, setGeneration] = useState(0);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState("");

  const finish = useCallback((message: string) => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    active.current = null;
    setOutput(message);
    setRunning(false);
  }, []);

  const stop = useCallback(
    (message = "Execution stopped. Python session reset.") => {
      finish(message);
      loaded.current = false;
      setGeneration((value) => value + 1);
    },
    [finish],
  );

  useEffect(() => {
    function receive(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== "null") {
        return;
      }
      const request = active.current;
      if (!request) {
        return;
      }
      if (event.data?.type === "runtime-error") {
        stop("Python could not start. Check your network connection and try again.");
        return;
      }
      const result = pythonResult(event.data, request.id);
      if (result !== null) {
        finish(result);
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [finish, frame, stop]);

  function dispatch(request: PythonRun) {
    frame.current?.contentWindow?.postMessage(request, "*");
  }

  function run(code: string) {
    if (active.current || code.length > 20000) {
      return;
    }
    const request: PythonRun = { type: "run", id: crypto.randomUUID(), code, stdin };
    active.current = request;
    setRunning(true);
    setOutput("Loading Python or running your code…");
    timer.current = setTimeout(
      () => stop("Execution timed out. Python session reset."),
      executionLimit,
    );
    if (generation === 0) {
      setGeneration(1);
    } else if (loaded.current) {
      dispatch(request);
    }
  }

  function frameLoaded() {
    loaded.current = true;
    if (active.current) {
      dispatch(active.current);
    }
  }

  return {
    generation,
    output,
    running,
    stdin,
    setStdin,
    run,
    stop,
    frameLoaded,
    clear: () => setOutput(""),
  };
}
