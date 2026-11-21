import type { NextConfig } from "next";

import { contentSecurityPolicy } from "./src/lib/risa-security-policy";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Strict fallback for metadata and static assets. HTML gets a request
  // nonce from Proxy (rather than unsafe-inline) at render time.
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
] as const;

// COEP is enforced only on pages without third-party media or remote public
// course thumbnails. A global require-corp policy can block YouTube iframes and
// Supabase images, so expand this list only after browser compatibility tests.
const coepProtectedRoutes = [
  "/about",
  "/contact",
  "/search",
  "/students/login",
  "/students/register",
  "/students/privacy",
] as const;

const coepHeader = {
  key: "Cross-Origin-Embedder-Policy",
  value: "require-corp",
} as const;

// Public catalogue pages display cookie-free Supabase images. Credentialless
// allows those images without allowing cross-origin YouTube iframes on lessons.
const coepPublicImageRoutes = ["/", "/programmes"] as const;
const coepPublicImageHeader = {
  key: "Cross-Origin-Embedder-Policy",
  value: "credentialless",
} as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Profile forms allow images up to 2 MB; Server Actions default to 1 MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb",
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
      ...coepProtectedRoutes.map((source) => ({
        source,
        headers: [coepHeader],
      })),
      ...coepPublicImageRoutes.map((source) => ({
        source,
        headers: [coepPublicImageHeader],
      })),
    ];
  },
};

export default nextConfig;
