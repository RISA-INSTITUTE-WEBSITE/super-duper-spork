# Browser Python runtime

Programming Studio uses Pyodide 314.0.8 (CPython compiled to WebAssembly), pinned
to its versioned CDN distribution. The first run downloads the interpreter;
subsequent runs reuse the worker and interpreter state. Standard input is supplied
before each run, one line per input call. Output and errors appear after execution.
Stop, Reset, changing workspace tabs and leaving the page discard the session.
The execution deadline is 120 seconds, source is limited to 20,000 characters,
input to 6,000 characters and displayed output to approximately 20,000 characters.

Python language features, the supported standard library and Pyodide-built
packages are available. Imports automatically load known packages. For example:

```python
import numpy as np

print(np.arange(5) ** 2)
```

Compatible PyPI wheels can be installed in the current session using:

```python
import micropip

await micropip.install("humanize")
import humanize

print(humanize.intcomma(1000000))
```

This is not a Linux host or unrestricted package runner. Native system calls,
subprocesses, platform-specific binary wheels, threading, desktop GUI libraries,
raw sockets and unrestricted third-party HTTP APIs are not guaranteed. Graphical
plot output is not implemented. Browser network access is restricted to the pinned
Pyodide CDN and PyPI package sources. Arbitrary web APIs are not enabled.

## Isolation

The main application retains its original CSP. Only /python-sandbox.html has the
narrow runtime policy, including a SHA-256 hash for the fixed bridge, WebAssembly
permission, a sandbox without allow-same-origin, no forms, and a package-source
network allowlist. The iframe and response both enforce the sandbox. The worker
inherits the frame's CSP through a blob URL. There are no server-side Python
processes, application credentials, student data or authenticated app API calls
in the worker protocol. Only code, stdin and a run identifier are sent. The host
accepts bounded text output only from its own opaque-origin frame. User code
cannot change the main application DOM. The runtime is not a substitute for a
resource-quota-enforced server sandbox: malicious code can still consume local
browser resources. Do not enter confidential information.

Regression tests cover actual Python features, packages, input, cancellation,
and the scoped response policy. Browser execution depends on CDN availability.

## Library manager

Open Python libraries in the Programming Studio sidebar. Choose a suggested
package or enter any package name, optionally with an exact version. Install
library runs micropip in the same interpreter as the editor. List installed
libraries prints the session package inventory. Installation errors remain in
the console and the editor source is not replaced. The suggestions include
data analysis, machine learning, mathematics, statistics, visualization and
applied sciences. They do not restrict the package names learners can request.

Packages are downloaded on demand, not all preloaded. The pinned Pyodide
package repository and compatible PyPI wheels are supported by the runtime;
native-only wheels and GPU runtimes are not guaranteed. Installation and
imports are subject to the existing session timeout and network policy.
The library manager does not introduce a new package source or server execution.
See https://pyodide.org/en/stable/usage/loading-packages.html for compatibility.
