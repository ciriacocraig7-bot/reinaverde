/**
 * Fixed-position SVG noise layer that gives every screen a paper-grain feel.
 * Cheap: one element, pure CSS, blended via multiply.
 */
export function GrainOverlay() {
  return <div className="rv-grain" aria-hidden="true" />;
}
