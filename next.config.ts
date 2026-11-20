import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "frame-src 'self' https://www.youtube-nocookie.com",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
    ].join("; "),
  },
] as const;

// COEP is enforced only on pages without third-party media or remote public
// course thumbnails. A global require-corp policy can block YouTube iframes and
// Supabase images, so expand this list only after browser compatibility tests.
const coepProtectedRoutes = [
  "/about",
  "/contact",
  "/students/login",
  "/students/register",
  "/students/privacy",
] as const;

const coepHeader = {
  key: "Cross-Origin-Embedder-Policy",
  value: "require-corp",
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
    ];
  },
};

export default nextConfig;
