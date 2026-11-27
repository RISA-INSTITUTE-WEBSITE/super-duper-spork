"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const executionLimit = 120_000;
type PythonRun = { type: "run"; id: string; code: string; stdin: string };

export function useBrowserPython() {
  const frame = useRef<HTMLIFrameElement>(null);
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

  const stop = useCallback((message = "Execution stopped. Python session reset.") => {
    finish(message);
    loaded.current = false;
    setGeneration((value) => value + 1);
  }, [finish]);

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
      } else if (event.data?.type === "result" && event.data.id === request.id) {
        const result = event.data.output;
        if (typeof result === "string") {
          finish(result.slice(0, 20100) || "Completed with no output.");
        }
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.removeEventListener("message", receive);
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    };
  }, [finish, stop]);

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
    frame,
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
