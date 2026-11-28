# Real Linux terminal (administrator preview)

Open Administration Centre → Labs → Practical Workspace → Linux terminal.
Start a session, enter Bash commands, and press Enter. The terminal uses
Vercel Sandbox REST endpoints to create an ephemeral Linux microVM rather
than executing commands on the Next.js server.

## Deployment prerequisites

- Enable Vercel OIDC for the RISA project; the server reads the function's
  x-vercel-oidc-token request header at runtime, with VERCEL_OIDC_TOKEN as
  the local-development fallback, and uses its project/owner claims.
- Configure a server-only RISA_LINUX_SESSION_SECRET (at least 32 characters,
  generated randomly) in the appropriate deployment environments. Never use
  a NEXT_PUBLIC variable or commit it.
- Confirm Sandbox usage is available and monitor the project budget.

No sandbox is created until an administrator explicitly starts a session.
The session expires after five minutes; it uses one vCPU, no ports, no
network access, no application secrets and no persistent snapshots.
Every action checks current administrator membership and the server-signed
session capability binds the VM to that administrator. Commands time out
after ten seconds; output is truncated at 24,000 characters. Commands start
in the provider-selected working directory (for example /vercel), not a
hard-coded path that may not exist in the runtime image. End session
stops the VM; leaving the page relies on automatic expiry.

## Smoke test on a configured preview

Run these commands one at a time:

```bash
uname -a
pwd
mkdir practice
cd practice
echo "RISA" > lesson.txt
cat lesson.txt
ls -la
pwd
cd ..
printf 'one\ntwo\n' | wc -l
false
```

Verify the created file and directory survive the next command, stdout and
stderr display, exit status is reported, history works with arrow keys,
and a second session cannot see the first session's files. Verify a learner
cannot access the workspace or execute its actions.

This first release runs a new Bash process per line: files and the working
directory persist within a VM, but shell variables/functions and interactive
TTY applications do not. Package installation and internet exercises are
not supported with network disabled. The previous simulated exercise helper
remains for existing assessment compatibility.
