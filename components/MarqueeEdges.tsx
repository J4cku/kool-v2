import ProgressiveBlur from './ProgressiveBlur';

/* The coral marquees run edge to edge, so without this the text is guillotined
   mid-letter at both sides. These dissolve it into the page instead.

   Tint only, deliberately: a backdrop-filter over text that never stops moving
   would repaint the whole band every frame, and over a flat beige background a
   gradient is indistinguishable from a blur.

   Expects a `relative overflow-hidden` marquee wrapper. */
export default function MarqueeEdges() {
  return (
    <>
      <ProgressiveBlur position="left" size="14%" blur={0} tint="var(--color-beige)" />
      <ProgressiveBlur position="right" size="14%" blur={0} tint="var(--color-beige)" />
    </>
  );
}
