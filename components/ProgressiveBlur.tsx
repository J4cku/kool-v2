type Edge = 'top' | 'bottom' | 'left' | 'right';

/* The effect always fades away from the named edge. */
const FADE_DIRECTION: Record<Edge, string> = {
  top: 'to bottom',
  bottom: 'to top',
  left: 'to right',
  right: 'to left',
};

const EDGE_BOX: Record<Edge, string> = {
  top: 'inset-x-0 top-0',
  bottom: 'inset-x-0 bottom-0',
  left: 'inset-y-0 left-0',
  right: 'inset-y-0 right-0',
};

/* Fraction of each layer's reach that stays fully opaque before its mask
   starts ramping. Without it the outermost pixel row is already partially
   unmasked on every layer and the edge never reaches full strength. */
const PLATEAU = 0.3;

interface ProgressiveBlurProps {
  /** Which edge the effect hugs; it fades inward from there. */
  position?: Edge;
  /** Depth of the effect — height for top/bottom, width for left/right. */
  size?: string;
  /** Number of stacked blur layers. Ignored when `blur` is 0. */
  layers?: number;
  /** Base blur radius in px; layer i uses blur × 2^i. 0 = tint only. */
  blur?: number;
  /** Optional colour faded in over the blur (same direction as the mask). */
  tint?: string;
  className?: string;
}

/* A progressive blur edge: a blur *ramp* rather than a band with a seam.
   One backdrop-filter can only be uniform, so N layers are stacked, each with
   twice the radius of the one below it and each masked to a shorter reach
   from the edge. Every layer's filter sees the layers behind it as part of its
   backdrop, so the radii accumulate where the layers overlap — hardest against
   the edge, thinning to nothing at `size`, with no step anywhere in between.

   Positioned absolutely; it expects a positioned ancestor sized to the area
   that should be affected (wrap it in a `fixed` box to pin it to the viewport).
   Decorative only — hidden from AT and transparent to pointer events. */
export default function ProgressiveBlur({
  position = 'bottom',
  size = '120px',
  layers = 4,
  blur = 2,
  tint,
  className = '',
}: ProgressiveBlurProps) {
  const direction = FADE_DIRECTION[position];
  const horizontal = position === 'left' || position === 'right';
  const layerCount = blur > 0 ? Math.max(1, Math.round(layers)) : 0;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${EDGE_BOX[position]} ${className}`}
      style={horizontal ? { width: size } : { height: size }}
    >
      {Array.from({ length: layerCount }, (_, i) => {
        const radius = blur * 2 ** i;
        const reach = ((layerCount - i) / layerCount) * 100;
        const mask =
          `linear-gradient(${direction}, rgb(0 0 0) 0%,` +
          ` rgb(0 0 0) ${(reach * PLATEAU).toFixed(2)}%,` +
          ` rgb(0 0 0 / 0) ${reach.toFixed(2)}%)`;

        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${radius}px)`,
              WebkitBackdropFilter: `blur(${radius}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}

      {tint && (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `linear-gradient(${direction}, ${tint}, transparent)` }}
        />
      )}
    </div>
  );
}
