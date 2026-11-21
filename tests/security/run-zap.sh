#!/usr/bin/env bash
# QA-DAST-01: run an active OWASP ZAP scan against a disposable local
# production-mode Next.js server, never real learner data or production.
# Keep fail-on-alert behavior; reports are copied back for CI artifacts.
set -euo pipefail

# Avoid an orphaned Next.js child after the scanner exits (Playwright needs port 3000).
./node_modules/.bin/next start --hostname 0.0.0.0 --port 3000 > /tmp/risa-zap-next.log 2>&1 &
server_pid=$!

# ZAP runs as a non-root user inside Docker; the GitHub checkout is not
# writable by that user. Mount a dedicated writable temporary work directory
# instead of changing permissions on the repository checkout.
report_dir="$(mktemp -d)"
chmod 0777 "$report_dir"
cp tests/security/zap/rules.conf "$report_dir/rules.conf"
trap 'kill "$server_pid" 2>/dev/null || true; rm -rf "$report_dir"' EXIT

ready=0
for attempt in $(seq 1 45); do
  if curl --fail --silent http://127.0.0.1:3000/ > /dev/null; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  cat /tmp/risa-zap-next.log
  exit 1
fi

# ZAP beta rule 20012 compares hidden inputs on repeated HTML responses.
# Its CI #671 report identified four READ-ONLY GET /search forms, plus the
# Next.js sign-in and registration Server Actions have cookie-bound CSRF.
# These four forms are exempted by ID; all OTHER forms remain scanned.
# HTTP + unit tests run before ZAP and verify both safe search methods and
# actual rejection of forged/missing sign-in and registration tokens.
# NEVER add other form IDs without evidence and matching regression tests.
csrf_reviewed_forms="risa-desktop-search-form,risa-mobile-search-form,risa-student-login-form,risa-student-registration-form"

# Docker uses host networking so 127.0.0.1 refers to this runner's server.
# The policy stays blocking; only the report location changes.
scan_status=0
docker run --rm --network host \
  -v "$report_dir:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t http://127.0.0.1:3000 \
    -c rules.conf -m 1 -J zap-report.json \
    -z "-config rules.csrf.ignorelist=$csrf_reviewed_forms" || scan_status=$?

if [ -f "$report_dir/zap-report.json" ]; then
  cp "$report_dir/zap-report.json" zap-report.json
fi
exit "$scan_status"
