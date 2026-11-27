# RISA Python Studio — Graphical Plot Rendering Plan

Status: Proposed, not implemented. Extends PR #76 after browser runtime validation.

## 1. User experience

Add a Plots tab beside Output Console in the existing VS Code-themed Programming
Studio. Preserve the text console, current source, themes, and input. The plot
viewer provides a figure gallery, figure count, zoom-to-fit, previous/next,
clear plots, and PNG download. The empty state explains how to call
`matplotlib.pyplot.show()`. On narrow screens the plot viewer stacks below
the editor.

## 2. First implementation: Matplotlib

Use the existing Pyodide worker and an explicitly non-interactive Agg backend.
Before executing a script that loads Matplotlib, configure the backend and
provide a show hook that captures open figures as PNG in memory using BytesIO.
Capture at show calls and at the end of execution if appropriate; deduplicate
figures per run and close captured figures to prevent accumulation. Verify
this behavior against the pinned Pyodide distribution. Retain tracebacks and
text output even if rendering a figure fails. NumPy, Pandas and SciPy plots
that use Matplotlib follow the same path. Do not require a new server process.

## 3. Worker protocol and security

Extend the worker-to-frame-to-host protocol with a separate plot message.
Include the active run identifier, bounded figure number, MIME type image/png,
and transferable binary bytes. The host must verify the current iframe source,
opaque origin and run ID before accepting any message. Validate PNG signature,
dimensions and byte length before decoding. Reject HTML, SVG and arbitrary URLs.
Do not inject learner-generated HTML or execute scripts in the parent.
Use object URLs only for validated PNG data and revoke them on clear, replace,
stop, tab change and unmount. Preserve the current sandbox and package-source
CSP; add only a narrowly justified image capability if needed. Never add app
credentials or arbitrary external connectivity.

Initial proposed limits: six figures per run, 1600 x 1200 pixels maximum,
2 MiB per PNG and 8 MiB total per run. Enforce limits before image encoding where
possible, then independently at the frame and host. Keep the existing execution
deadline and output cap. Cancellation discards partial or late results.

## 4. Teaching examples

- Physics: displacement versus time, projectile trajectories and oscillations.
- Mathematics: functions, derivatives and numerical integration.
- Data Science: scatter plots, histograms and correlation heatmaps.
- Computing: algorithm complexity and benchmark visualization.
- Chemistry: concentration and reaction-rate curves.

Use ordinary Matplotlib scripts with labels, titles, legends and show calls.
Include accessible figure numbering and a concise description field; do not
claim that automatically generated captions interpret the data correctly.

## 5. Test and release gates

- Real Chromium execution of Matplotlib line, scatter and multiple-figure plots.
- Combined printed output, plot output and a Python exception.
- Plot count, size and total byte bounds; invalid PNG and forged message rejection.
- No stale images after cancellation, reset or switching workspace tabs.
- Theme switching does not alter source or existing plots.
- Mobile layout, keyboard access, download, object URL cleanup.
- Verify sandbox CSP and the original application security headers independently.
- Run repository formatting, type checking, unit coverage, browser tests, and
  production preview. Test cold start and library loading on a lower-memory phone.
- Record runtime versions and actual test results before merging.

## 6. Later phases

Add structured Plotly data rendered by a trusted host component with a pinned
dependency and validated trace schema, rather than accepting arbitrary HTML.
Consider interactive zoom/pan, multi-series plots and optional CSV upload only
after the PNG pipeline passes security and performance tests. Scientific 3D
plots, animation and graded plot evidence are separate future work.

No plot rendering, storage or formal grading changes are included in this plan.
