# Python Studio startup repair

The reported screenshot shows a worker startup error and Python statements in
standard input rather than the main editor. The old error handler discarded
the browser error. This patch distinguishes frame readiness, interpreter
startup, and script execution.

The primary interpreter remains Pyodide 314.0.8 using a module worker. If
initialization fails, a separate classic worker tries the pinned Pyodide
0.29.4 distribution. The fallback is attempted before any user code is sent.
Both remain inside the existing opaque-origin admin-only sandbox, with a
version-specific CDN allowlist. Python package versions may differ between
the two runtimes. The footer identifies the actual Pyodide version.

Interpreter startup has a 45-second deadline per attempt and the entire run
has a 180-second deadline. Stop recreates the sandbox. Error details are
bounded plain text. Source belongs in main.py; standard input contains only
answers to input() prompts.

The reported production failure was not reproduced locally because browser
and external network access were unavailable. The compatibility fallback is
a proposed correction, not proof of the original root cause. Validate real
execution and NumPy/Pandas loading in Chromium before merging.
