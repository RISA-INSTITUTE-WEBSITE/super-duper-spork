import type { Metadata } from "next";

import { ComputingLab } from "@/components/computing-lab";

export const metadata: Metadata = {
  title: "Computing Lab",
  description:
    "Explore binary representation and digital logic through hands-on CS101 labs.",
};

export default function ComputingLabPage() {
  return <ComputingLab />;
}
