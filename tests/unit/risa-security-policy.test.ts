import { afterEach, describe, expect, it } from "vitest";

import {
  allowedImageSources,
  contentSecurityPolicy,
  newCspNonce,
} from "../../src/lib/risa-security-policy";

const previousUrl = process.env.RISA_SUPABASE_URL;

afterEach(() => {
  if (previousUrl === undefined) {
    delete process.env.RISA_SUPABASE_URL;
  } else {
    process.env.RISA_SUPABASE_URL = previousUrl;
  }
});

describe("RISA strict Content Security Policy", () => {
  it("uses a fresh unpredictable nonce for HTML hydration scripts", () => {
    const first = newCspNonce();
    const second = newCspNonce();

    expect(first).toMatch(/^[A-Za-z0-9+/]{22}==$/);
    expect(second).not.toBe(first);
    const csp = contentSecurityPolicy(first);

    expect(csp).toContain(`script-src 'self' 'nonce-${first}' 'strict-dynamic'`);
    expect(csp).toContain(`style-src 'self' 'nonce-${first}'`);
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("style-src 'self' 'unsafe-inline'");
  });

  it("keeps a strict fallback on unproxied static assets", () => {
    const csp = contentSecurityPolicy();
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toContain("nonce-");
  });

  it("permits only the image origins used by the website", () => {
    delete process.env.RISA_SUPABASE_URL;
    expect(allowedImageSources()).toBe("'self' data: blob: https://i.ytimg.com");

    process.env.RISA_SUPABASE_URL = "https://courses.supabase.co/";
    expect(allowedImageSources()).toContain("https://courses.supabase.co");
    expect(allowedImageSources()).not.toContain("https: ");
  });

  it.each([
    "javascript:alert(1)",
    "https://example.com/auth",
    "https://name:password@example.com/",
    "not a URL",
  ])("never interpolates a malformed image origin (%s)", (value) => {
    process.env.RISA_SUPABASE_URL = value;
    expect(allowedImageSources()).not.toContain(value);
  });
});
