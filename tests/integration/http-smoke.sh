#!/usr/bin/env bash
# QA-HTTP-01..03: validate the built site as a running HTTP application.
# CI executes this only after npm run build, so there is no need to mock routing.
# Fails immediately if pages, missing-route semantics or required headers regress.
set -euo pipefail

# Start the Node process directly: killing an npm wrapper leaves next start alive.
./node_modules/.bin/next start --hostname 0.0.0.0 --port 3000 > /tmp/risa-http-smoke.log 2>&1 &
server_pid=$!
trap 'kill "$server_pid" 2>/dev/null || true' EXIT

# QA-HTTP-01: wait for readiness and prove the homepage responds successfully.
ready=0
for attempt in $(seq 1 45); do
  if curl --fail --silent http://127.0.0.1:3000/ > /dev/null; then
    ready=1
    break
  fi
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  cat /tmp/risa-http-smoke.log
  exit 1
fi

# QA-HTTP-02: all public routes must work; a nonexistent route must return 404.
for route in / /about /contact /programmes; do
  curl --fail --silent --show-error "http://127.0.0.1:3000$route" > /dev/null
done
test "$(curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:3000/missing-route)" = "404"

# QA-HTTP-03: server-side security headers must be present on HTTP responses.
curl --fail --silent --show-error --head http://127.0.0.1:3000/ |
  grep --ignore-case --quiet '^x-content-type-options: nosniff'
curl --fail --silent --show-error --head http://127.0.0.1:3000/ |
  grep --ignore-case --quiet '^x-frame-options: DENY'
curl --fail --silent --show-error --head http://127.0.0.1:3000/ |
  grep --ignore-case --quiet '^content-security-policy:'
# QA-HTTP-04: COEP is enforced on selected pages without third-party embeds.
for route in /about /contact /search /students/login /students/register /students/privacy; do
  curl --fail --silent --show-error --head "http://127.0.0.1:3000$route" |
    grep --ignore-case --quiet '^cross-origin-embedder-policy: require-corp'
done

# No global COEP enforcement: homepage/course catalogue uses public Supabase
# thumbnail images, and student/admin course views embed third-party YouTube.
if curl --fail --silent --show-error --head http://127.0.0.1:3000/ |
  grep --ignore-case --quiet '^cross-origin-embedder-policy: require-corp'; then
  echo "Unexpected global COEP enforcement: public thumbnails may break"
  exit 1
fi
# QA-HTTP-05: the login and registration HTML must receive a matching
# unpredictable CSRF token and browser cookie before any authentication request.
node tests/security/assert-account-csrf.mjs

# QA-HTTP-06: nonce-bound Next.js hydration and narrowly compatible COEP/CORP.
node tests/security/assert-security-headers.mjs

echo "QA-HTTP checks passed"
