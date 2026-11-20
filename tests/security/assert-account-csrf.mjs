// QA-HTTP-05: account forms must expose the exact random CSRF value stored
// in the matching host-only cookie; a returning browser must keep that value.
// This checks rendered HTTP behavior without Supabase credentials or real users.
const base = "http://127.0.0.1:3000";

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function readForm(path, cookie) {
  const response = await fetch(base + path, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: "manual",
  });
  check(response.status === 200, path + " returned HTTP " + response.status);
  const html = await response.text();
  const inputs = html.match(/<input\b[^>]*>/g) ?? [];
  const csrfInput = inputs.find((input) => /\bname="csrf_token"/.test(input));
  const value = csrfInput?.match(/\bvalue="([A-Za-z0-9_-]{43})"/)?.[1];
  check(Boolean(value), path + " is missing its hidden CSRF token");
  return { response, token: value };
}

for (const path of ["/students/login", "/students/register"]) {
  const first = await readForm(path);
  const issuedCookie = first.response.headers
    .getSetCookie()
    .find((header) => /^(?:__Host-)?risa-student-csrf=/.test(header));
  const cookieName = issuedCookie?.split("=")[0];
  check(Boolean(issuedCookie), path + " did not issue its CSRF cookie");
  const cookieValue = issuedCookie?.split(";")[0].slice(cookieName.length + 1);
  check(cookieValue === first.token, path + " form value differs from its cookie");
  check(/;\s*HttpOnly\b/i.test(issuedCookie), path + " cookie is not HttpOnly");
  check(
    /;\s*SameSite=Strict\b/i.test(issuedCookie),
    path + " cookie lacks SameSite=Strict",
  );
  check(/;\s*Path=\/(?:;|$)/i.test(issuedCookie), path + " cookie lacks Path=/");
  if (cookieName === "__Host-risa-student-csrf") {
    check(/;\s*Secure\b/i.test(issuedCookie), path + " production cookie lacks Secure");
  }

  const returning = await readForm(path, cookieName + "=" + cookieValue);
  check(returning.token === first.token, path + " replaced a valid returning token");

  const tampered = await readForm(path, cookieName + "=invalid");
  check(tampered.token !== first.token, path + " accepted a malformed cookie");
  process.stdout.write("CSRF form/cookie checks passed: " + path + "\\n");
}
