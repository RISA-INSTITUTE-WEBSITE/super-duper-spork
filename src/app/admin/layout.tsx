import type { ReactNode } from "react";

import { RisaAdminNavigation } from "@/components/risa-admin-navigation";
import { requireAdminSession } from "@/lib/risa-staff-session";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminSession();

  return (
    <>
      <RisaAdminNavigation />
      {children}
    </>
  );
}
