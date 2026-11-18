import { OrbitalSpinLoader } from "@/components/orbital-spin-loader";

/** Next.js route loading boundary; no artificial loading delay is introduced. */
export default function Loading() {
  return (
    <main
      id="main-content"
      className="flex min-h-[50vh] flex-1 items-center justify-center"
    >
      <OrbitalSpinLoader />
    </main>
  );
}
