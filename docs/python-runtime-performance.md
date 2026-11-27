# Python Studio runtime performance

The browser initializes one interpreter when the administrator opens the
Programming Studio, while they read or type code. Run queues the script if
initialization has not finished. Once ready, subsequent runs reuse the worker,
Python globals and installed packages. Stop, Reset and leaving the programming
workspace still discard the interpreter. Initialization failures do not loop
automatically; pressing Run requests a retry.

Remember the last successful pinned runtime variant in browser local storage
(a primary/compatibility preference only). If that variant fails, try the other
pinned version once before showing an error. This avoids repeating an expensive
failed initialization on browsers that need the compatibility build. No user
code is replayed. No additional package sources or permissions are introduced.

Scripts without import/from tokens skip the import-discovery step. Scripts
using imports retain normal automatic package loading; no scientific packages
are downloaded speculatively. The existing isolated worker and CSP are intact.

The footer displays readiness, successful interpreter initialization time
(milliseconds inside the worker) and total elapsed time from Run to result
(including input waits and any package downloads). These are measurements on
the current device, not a guaranteed latency target. First-time downloads,
browser cache behaviour and large scientific imports can still take time.
No performance speedup has been measured on the reported user's device.

Browser tests check readiness before Run, retained interpreter state and timing
display. Existing interactive input, library manager and sandbox tests remain.
