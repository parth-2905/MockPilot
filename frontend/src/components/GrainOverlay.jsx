export default function GrainOverlay() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden" 
      style={{ zIndex: 2 }}
    >
      <svg
        className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2 opacity-[0.14] pointer-events-none"
        style={{
          animation: "grain-shift 0.8s steps(6) infinite",
        }}
      >
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.80"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-noise)" />
      </svg>
    </div>
  );
}
