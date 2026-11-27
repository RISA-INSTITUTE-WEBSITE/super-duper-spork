import { createHash } from "node:crypto";

// This source runs in a dedicated worker owned by an opaque-origin frame.
// Do not pass credentials, account data, or privileged capabilities to it.
const runtimeWorker = `
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/pyodide.mjs";

let runtime;
let busy = false;
self.onmessage = async ({ data }) => {
  if (busy || data?.type !== "run") return;
  busy = true;
  let output = "";
  let truncated = false;
  const append = (value) => {
    if (output.length >= 20000) { truncated = true; return; }
    const line = String(value) + "\\n";
    if (line.length > 20000 - output.length) truncated = true;
    output += line.slice(0, 20000 - output.length);
  };
  try {
    runtime ??= await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.8/full/",
      stdout: () => {},
      stderr: () => {},
    });
    const input = data.stdin === "" ? [] : data.stdin.split("\\n");
    runtime.setStdin({ stdin: () => input.shift() ?? null });
    runtime.setStdout({ batched: append });
    runtime.setStderr({ batched: append });
    await runtime.loadPackagesFromImports(data.code, {
      messageCallback: () => {},
      errorCallback: append,
    });
    const result = await runtime.runPythonAsync(data.code);
    if (result !== undefined && result !== null) {
      try { append(result); } finally { result?.destroy?.(); }
    }
  } catch (error) {
    append(error);
  } finally {
    self.postMessage({
      type: "result",
      id: data.id,
      output: output.trimEnd() + (truncated ? "\\n[Output truncated]" : ""),
    });
    busy = false;
  }
};
`;

// Only the trusted bridge runs in the frame; learner Python runs in the worker.
// The frame has no same-origin permission, no forms, and no app API connectivity.
const bridge = `
(() => {
  if (parent === window) return;
  const parentOrigin = new URL(location.href).origin;
  let worker;
  let workerUrl;
  const send = (message) => parent.postMessage(message, parentOrigin);
  function releaseWorker() {
    worker?.terminate();
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    worker = undefined;
    workerUrl = undefined;
  }
  function createWorker() {
    workerUrl = URL.createObjectURL(new Blob([${JSON.stringify(runtimeWorker)}], {
      type: "text/javascript",
    }));
    worker = new Worker(workerUrl, { type: "module" });
    worker.onmessage = ({ data }) => {
      if (data?.type === "result" && typeof data.output === "string") {
        send({ type: "result", id: data.id, output: data.output.slice(0, 20100) });
      }
    };
    worker.onerror = () => {
      send({ type: "runtime-error" });
      releaseWorker();
    };
  }
  addEventListener("message", (event) => {
    if (event.source !== parent || event.origin !== parentOrigin) return;
    const data = event.data;
    if (data?.type !== "run" || typeof data.id !== "string") return;
    if (typeof data.code !== "string" || data.code.length > 20000) return;
    if (typeof data.stdin !== "string" || data.stdin.length > 6000) return;
    try {
      if (!worker) createWorker();
      worker.postMessage({ type: "run", id: data.id, code: data.code, stdin: data.stdin });
    } catch {
      send({ type: "runtime-error" });
      releaseWorker();
    }
  });
  addEventListener("pagehide", releaseWorker);
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
    "' 'wasm-unsafe-eval' blob: https://cdn.jsdelivr.net/pyodide/v314.0.8/full/",
  "worker-src blob:",
  "connect-src https://cdn.jsdelivr.net/pyodide/v314.0.8/full/ https://pypi.org https://files.pythonhosted.org",
].join("; ");

export const pythonSandboxHtml =
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Isolated Python runtime</title></head><body><script>' +
  bridge +
  "</script></body></html>";
