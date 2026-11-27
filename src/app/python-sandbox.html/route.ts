import { pythonSandboxHtml, pythonSandboxPolicy } from "../../python-sandbox/runtime";

export function GET() {
  return new Response(pythonSandboxHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": pythonSandboxPolicy,
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
