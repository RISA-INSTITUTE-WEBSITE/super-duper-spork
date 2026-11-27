import type { Metadata } from "next";

import { requireAdminSession } from "@/lib/risa-staff-session";
import { ComputingLab } from "@/components/computing-lab";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Computing Lab",
  robots: { index: false, follow: false },
  description:
    "Explore binary representation and digital logic through hands-on CS101 labs.",
};

export default async function ComputingLabPage() {
  await requireAdminSession();
  return <ComputingLab />;
}
