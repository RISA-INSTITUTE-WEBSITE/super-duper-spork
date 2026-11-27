# Interactive Python terminal

The Programming Studio replaces the separate pre-filled standard input field
with an interactive Terminal. Python built-in input() is connected to a
JavaScript Promise via Pyodide's run_sync bridge. A running script is suspended
until Enter supplies one line. Its state remains in the same isolated worker;
scripts are not replayed. Output is streamed and input is echoed in sequence.
The terminal automatically focuses the response field and scrolls to the end.

Both pinned runtime versions keep the existing opaque-origin admin-only frame
and CSP. No new network access, shared memory, or server-side execution is
introduced. Interactive input requires JavaScript Promise Integration (JSPI),
as supported by recent Chrome and Edge releases. If unavailable, input() raises
an explicit compatibility error; ordinary scripts remain usable. This change
supports built-in input(), not arbitrary native stdin reads or a shell/PTY.

Limits: 100 responses per run, 1,000 characters per response, 6,000 total input
characters, 20,000 output characters. The execution watchdog allows 180 seconds
of execution between prompts and five minutes for each input response. Stop
and Reset discard the session. Do not enter secrets in the terminal.

Browser acceptance tests cover sequential bill/tip/people inputs, output order,
focus, no replay, cancellation, packages and the existing security headers.
