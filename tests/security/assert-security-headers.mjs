// Production-mode integration checks for nonce CSP, browser isolation headers,
// public static images and malformed image optimization requests.
const base = "http://127.0.0.1:3000";

function check(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function page(path) {
  const response = await fetch(base + path);
  check(response.status === 200, path + " returned HTTP " + response.status);
  return { html: await response.text(), headers: response.headers };
}

function policyDirectives(csp) {
  return new Map(
    csp
      .split(";")
      .map((part) => part.trim().split(/\s+/))
      .map(([name, ...values]) => [name, values]),
  );
}

const homepage = await page("/");
const homepagePolicy = homepage.headers.get("content-security-policy") ?? "";
const directives = policyDirectives(homepagePolicy);
const script = directives.get("script-src") ?? [];
const style = directives.get("style-src") ?? [];
const image = directives.get("img-src") ?? [];
const nonce = script.find((value) => value.startsWith("'nonce-"))?.slice(7, -1);

check(Boolean(nonce), "Homepage is missing a nonce-based CSP");
check(style.includes("'nonce-" + nonce + "'"), "Style nonce does not match script nonce");
check(
  !script.includes("'unsafe-inline'"),
  "JavaScript unsafe-inline must not be allowed",
);
check(!style.includes("'unsafe-inline'"), "Inline style blocks must require nonce");
check(!image.includes("https:"), "CSP still permits all HTTPS image origins");
check(image.includes("https://i.ytimg.com"), "YouTube thumbnails would be blocked");
check(image.includes("blob:"), "Profile image previews would be blocked");
check(image.includes("data:"), "Inline data images would be blocked");

const inlineScripts = [...homepage.html.matchAll(/<script\b[^>]*>/g)].map(
  (match) => match[0],
);
check(inlineScripts.length > 0, "Expected Next.js hydration scripts in home HTML");
check(
  inlineScripts.every((tag) => tag.includes('nonce="' + nonce + '"')),
  "Some Next.js hydration scripts are missing the response CSP nonce",
);
check(
  !homepage.html.includes("/_next/image?"),
  "Static RISA hero imagery should no longer invoke image optimization",
);
check(
  homepage.headers.get("cross-origin-embedder-policy") === "credentialless",
  "Homepage should use credentialless for cookie-free public course images",
);
check(
  homepage.headers.get("cross-origin-opener-policy") === "same-origin",
  "Homepage is missing COOP",
);
check(
  homepage.headers.get("cross-origin-resource-policy") === "same-origin",
  "Homepage is missing CORP",
);

const repeat = await page("/");
const secondNonce = policyDirectives(repeat.headers.get("content-security-policy") ?? "")
  .get("script-src")
  ?.find((value) => value.startsWith("'nonce-"));
check(
  Boolean(secondNonce) && secondNonce !== "'nonce-" + nonce + "'",
  "Nonce was reused",
);

const programmes = await page("/programmes");
check(
  programmes.headers.get("cross-origin-embedder-policy") === "credentialless",
  "Course catalogue must permit credentialless external public images",
);

const login = await page("/students/login");
check(
  login.headers.get("cross-origin-embedder-policy") === "require-corp",
  "Auth pages must retain their strict COEP policy",
);

for (const path of ["/robots.txt", "/sitemap.xml"]) {
  const response = await fetch(base + path);
  check(response.ok, path + " cannot be fetched");
  const fallback = policyDirectives(
    response.headers.get("content-security-policy") ?? "",
  );
  check(
    !(fallback.get("script-src") ?? []).includes("'unsafe-inline'"),
    path + " still enables arbitrary inline JavaScript",
  );
}

const hero = await fetch(base + "/images/risa-home/devops.png");
check(
  hero.ok && (hero.headers.get("content-type") ?? "").startsWith("image/"),
  "Hero photo missing",
);

// Invalid optimizer parameters should never yield file contents or stack traces.
const malformed = await fetch(base + "/_next/image?url=%2Fimage&w=3840&q=75");
check(malformed.status >= 400, "Malformed image request unexpectedly returned success");
const errorBody = await malformed.text();
check(
  !/(?:process\.env|BEGIN PRIVATE KEY|\/home\/runner\/work|webpack-internal)/i.test(
    errorBody,
  ),
  "Image error leaked sensitive internals",
);
process.stdout.write(
  "RISA nonce CSP, cross-origin policies and image safeguards passed\n",
);
