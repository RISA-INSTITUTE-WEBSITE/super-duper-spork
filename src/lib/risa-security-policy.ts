import { randomBytes } from "node:crypto";

/** Match the only remote image sources actually used by RISA. */
export function allowedImageSources(): string {
  const sources = ["'self'", "data:", "blob:", "https://i.ytimg.com"];
  const configured = process.env.RISA_SUPABASE_URL;

  if (configured) {
    try {
      const url = new URL(configured);
      if (
        url.protocol === "https:" &&
        url.pathname === "/" &&
        !url.username &&
        !url.password &&
        !url.search &&
        !url.hash
      ) {
        sources.push(url.origin);
      }
    } catch {
      // Never interpolate an invalid deployment URL into a security header.
    }
  }

  return sources.join(" ");
}

/**
 * Next.js generates inline hydration scripts. The Proxy supplies a fresh
 * nonce so those scripts are permitted without allowing arbitrary inline JS.
 * CSS style attributes remain allowed for RISA's animated hero and React UI,
 * while inline <style> blocks require the nonce.
 */
export function contentSecurityPolicy(nonce?: string): string {
  const script = nonce
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : "script-src 'self'";
  const style = nonce ? `style-src 'self' 'nonce-${nonce}'` : "style-src 'self'";
  const developmentEval =
    nonce && process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "frame-src 'self' https://www.youtube-nocookie.com",
    `img-src ${allowedImageSources()}`,
    style,
    "style-src-attr 'unsafe-inline'",
    script + developmentEval,
    "script-src-attr 'none'",
    "font-src 'self' data:",
    "connect-src 'self'",
  ].join("; ");
}

export function newCspNonce(): string {
  return randomBytes(16).toString("base64");
}
