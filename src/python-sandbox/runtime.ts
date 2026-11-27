import { createHash } from "node:crypto";

const primary = "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/";
const compatibility = "https://cdn.jsdelivr.net/pyodide/v0.29.4/full/";

// Both workers use the same opaque-origin sandbox and bounded protocol.
// Load the interpreter before accepting user code so startup can be retried
// without executing the user's script twice.
function workerSource(legacy: boolean) {
  const indexURL = legacy ? compatibility : primary;
  const loader = legacy
    ? `importScripts(${JSON.stringify(indexURL + "pyodide.js")});
    const loadPyodide = self.loadPyodide;`
    : `const { loadPyodide } = await import(${JSON.stringify(indexURL + "pyodide.mjs")});`;

  return `
let runtime;
let busy = false;
let pendingInput;
let runId;
let inputCount = 0;
let inputSize = 0;
let output = "";
let truncated = false;
let streamTimer;
const send = (message) => self.postMessage({ ...message, id: runId });
function flush() {
  clearTimeout(streamTimer);
  streamTimer = undefined;
  send({ type: "terminal-output", output });
}
function append(value) {
  if (output.length >= 20000) { truncated = true; return; }
  const text = String(value);
  if (text.length > 20000 - output.length) truncated = true;
  output += text.slice(0, 20000 - output.length);
  if (streamTimer === undefined) streamTimer = setTimeout(flush, 40);
}
function requestLine(prompt) {
  if (pendingInput || inputCount >= 100 || inputSize >= 6000) {
    return Promise.reject(new Error("Terminal input limit reached."));
  }
  inputCount += 1;
  append(prompt);
  flush();
  return new Promise((resolve) => {
    pendingInput = { resolve, sequence: inputCount };
    send({ type: "terminal-input", sequence: inputCount });
  });
}
function acceptLine(data) {
  if (!pendingInput || data.id !== runId || data.sequence !== pendingInput.sequence) return;
  if (typeof data.value !== "string" || data.value.length > 1000 || /[\\r\\n]/.test(data.value)) return;
  const { resolve } = pendingInput;
  pendingInput = undefined;
  inputSize += data.value.length + 1;
  if (inputSize > 6000) {
    resolve(null);
    return;
  }
  append(data.value + "\\n");
  flush();
  resolve(data.value);
}
const boot = async () => {
  const started = performance.now();
  try {
    ${loader}
    runtime = await loadPyodide({
      indexURL: ${JSON.stringify(indexURL)},
      stdout: () => {},
      stderr: () => {},
    });
    runtime.registerJsModule("_risa_terminal", { requestLine });
    runtime.runPython(${JSON.stringify(
      [
        "import builtins as _builtins",
        "import sys as _sys",
        "from pyodide.ffi import run_sync as _run_sync, can_run_sync as _can_run_sync",
        "from _risa_terminal import requestLine as _request_line",
        "def _terminal_input(prompt=''):",
        "    if not _can_run_sync():",
        "        raise RuntimeError('Interactive input requires a JSPI-capable browser. Update Chrome or Edge and retry.')",
        "    _sys.stdout.flush()",
        "    _sys.stderr.flush()",
        "    value = _run_sync(_request_line(str(prompt)))",
        "    if value is None:",
        "        raise EOFError('Terminal input limit reached')",
        "    return str(value)",
        "_builtins.input = _terminal_input",
      ].join("\n"),
    )});
    self.postMessage({ type: "ready", version: runtime.version, startupMs: performance.now() - started });
  } catch (error) {
    self.postMessage({ type: "boot-error", detail: String(error).slice(0, 500) });
  }
};
self.onmessage = async ({ data }) => {
  if (data?.type === "input") { acceptLine(data); return; }
  if (!runtime || busy || data?.type !== "run") return;
  busy = true;
  runId = data.id;
  inputCount = 0;
  inputSize = 0;
  output = "";
  truncated = false;
  const stdoutDecoder = new TextDecoder();
  const stderrDecoder = new TextDecoder();
  const write = (decoder) => (buffer) => {
    append(decoder.decode(buffer, { stream: true }));
    return buffer.length;
  };
  try {
    runtime.setStdin({ error: true });
    runtime.setStdout({ write: write(stdoutDecoder), isatty: true });
    runtime.setStderr({ write: write(stderrDecoder), isatty: true });
    // Ordinary scripts do not need a package-import discovery pass.
    if (/\\b(?:import|from)\\b/.test(data.code)) {
      await runtime.loadPackagesFromImports(data.code, {
        messageCallback: () => {},
        errorCallback: (error) => append(String(error) + "\\n"),
      });
    }
    const result = await runtime.runPythonAsync(data.code);
    if (result !== undefined && result !== null) {
      try { append(String(result) + "\\n"); } finally { result?.destroy?.(); }
    }
  } catch (error) {
    append(String(error) + "\\n");
  } finally {
    append(stdoutDecoder.decode());
    append(stderrDecoder.decode());
    clearTimeout(streamTimer);
    streamTimer = undefined;
    pendingInput = undefined;
    self.postMessage({
      type: "result",
      id: data.id,
      output: output.trimEnd() + (truncated ? "\\n[Output truncated]" : ""),
    });
    busy = false;
  }
};
boot();
`;
}

// The frame never gets same-origin permission or authenticated API access.
// Retry only a failed initialization, never a script that has started running.
const bridge = `
(() => {
  if (parent === window) return;
  const parentOrigin = new URL(location.href).origin;
  let worker;
  let workerUrl;
  let pending;
  let inputSequence;
  let ready = false;
  let legacy = false;
  let preferredLegacy = false;
  let triedFallback = false;
  let bootTimer;
  let primaryError = "";
  const send = (message) => parent.postMessage(message, parentOrigin);
  function releaseWorker() {
    clearTimeout(bootTimer);
    worker?.terminate();
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    worker = undefined;
    workerUrl = undefined;
    ready = false;
    inputSequence = undefined;
  }
  function fail(detail) {
    const wasReady = ready;
    releaseWorker();
    if (!wasReady && !triedFallback) {
      primaryError = detail;
      triedFallback = true;
      legacy = !legacy;
      send({ type: "runtime-status", message: "Trying alternate Python runtime…" });
      createWorker();
      return;
    }
    const message = primaryError ? primaryError + "; fallback: " + detail : detail;
    send({ type: "runtime-error", detail: message.slice(0, 1000) });
    pending = undefined;
  }
  function startWorker() {
    legacy = preferredLegacy;
    triedFallback = false;
    primaryError = "";
    createWorker();
  }
  function createWorker() {
    try {
      const source = legacy ? ${JSON.stringify(workerSource(true))} : ${JSON.stringify(workerSource(false))};
      workerUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
      const current = new Worker(workerUrl, { type: legacy ? "classic" : "module" });
      worker = current;
      bootTimer = setTimeout(() => fail("Interpreter startup timed out"), 45000);
      current.onmessage = ({ data }) => {
        if (worker !== current) return;
        if (!ready && data?.type === "boot-error") {
          fail(String(data.detail || "Interpreter download failed"));
        } else if (!ready && data?.type === "ready") {
          clearTimeout(bootTimer);
          ready = true;
          send({ type: "runtime-ready", version: String(data.version).slice(0, 40), startupMs: data.startupMs, legacy });
          if (pending) current.postMessage(pending);
        } else if (ready && data?.type === "terminal-output" && data.id === pending?.id && typeof data.output === "string") {
          send({ type: "terminal-output", id: data.id, output: data.output.slice(0, 20000) });
        } else if (ready && data?.type === "terminal-input" && data.id === pending?.id && Number.isInteger(data.sequence) && data.sequence > 0 && data.sequence <= 100 && inputSequence === undefined) {
          inputSequence = data.sequence;
          send({ type: "terminal-input", id: data.id, sequence: data.sequence });
        } else if (ready && data?.type === "result" && data.id === pending?.id && typeof data.output === "string") {
          send({ type: "result", id: data.id, output: data.output.slice(0, 20100) });
          pending = undefined;
          inputSequence = undefined;
        }
      };
      current.onerror = (event) => {
        if (worker === current) fail(event.message || "Browser could not start the Python worker");
      };
    } catch (error) {
      fail(String(error));
    }
  }
  addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== parentOrigin) return;
    const data = event.data;
    if (data?.type === "warmup") {
      preferredLegacy = data.preferCompatibility === true;
      if (!worker) startWorker();
      return;
    }
    if (data?.type === "input") {
      if (!ready || !pending || data.id !== pending.id || data.sequence !== inputSequence || inputSequence === undefined) return;
      if (typeof data.value !== "string" || data.value.length > 1000 || /[\\r\\n]/.test(data.value)) return;
      inputSequence = undefined;
      worker.postMessage({ type: "input", id: data.id, sequence: data.sequence, value: data.value });
      return;
    }
    if (pending || data?.type !== "run" || typeof data.id !== "string") return;
    if (typeof data.code !== "string" || data.code.length > 20000) return;
    pending = { type: "run", id: data.id, code: data.code };
    if (!worker) startWorker();
    else if (ready) worker.postMessage(pending);
  });
  addEventListener("pagehide", releaseWorker);
  send({ type: "frame-ready" });
})();
`;

const bridgeHash = createHash("sha256").update(bridge).digest("base64");

export const pythonSandboxPolicy = [
  "default-src 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  "form-action 'none'",
  "frame-ancestors 'self'",
  "sandbox allow-scripts",
  "script-src 'sha256-" +
    bridgeHash +
    "' 'wasm-unsafe-eval' blob: " +
    primary +
    " " +
    compatibility,
  "worker-src blob:",
  "connect-src " +
    primary +
    " " +
    compatibility +
    " https://pypi.org https://files.pythonhosted.org",
].join("; ");

export const pythonSandboxHtml =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Isolated Python runtime</title></head><body><script>' +
  bridge +
  "</script></body></html>";
