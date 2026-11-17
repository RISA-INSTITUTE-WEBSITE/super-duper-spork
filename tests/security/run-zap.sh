#!/usr/bin/env bash
# QA-DAST-01: run an active OWASP ZAP scan only against a disposable local
# production-mode Next.js server, never against real learner data or production.
# ZAP's rule policy is in tests/security/zap/rules.conf.
# Any ZAP nonzero exit code blocks the PR; the workflow uploads a JSON report.
set -euo pipefail

npm run start -- --hostname 0.0.0.0 --port 3000 > /tmp/risa-zap-next.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

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

# Docker uses host networking so 127.0.0.1 refers to this runner's server.
docker run --rm --network host \
  -v "$PWD:/zap/wrk:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t http://127.0.0.1:3000 \
    -c tests/security/zap/rules.conf -m 1 -J zap-report.json
