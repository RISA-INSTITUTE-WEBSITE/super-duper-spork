import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/risa-staff-session";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function LabsPage() {
  await requireAdminSession();
  redirect("/admin/labs");
}
