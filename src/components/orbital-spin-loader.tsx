/**
 * RISA Option 01 — Orbital Spin.
 * Matches the approved original concept: charcoal core, blue orbital track,
 * and one lime-green particle moving around the edge.
 */
export function OrbitalSpinLoader() {
  return (
    <div className="risa-orbital-spin" role="status" aria-label="Loading">
      <span className="risa-orbital-spin__core" aria-hidden="true" />
      <span className="risa-orbital-spin__orbit" aria-hidden="true" />
    </div>
  );
}
