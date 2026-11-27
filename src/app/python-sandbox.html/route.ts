import { requireAdminSession } from "@/lib/risa-staff-session";
import { pythonSandboxHtml, pythonSandboxPolicy } from "../../python-sandbox/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdminSession();
  return new Response(pythonSandboxHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": pythonSandboxPolicy,
      "X-Frame-Options": "SAMEORIGIN",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
