export function getComparisonSliderPosition(
  current: number,
  key: string,
  step = 5,
) {
  if (!Number.isFinite(current)) {
    throw new RangeError('current must be finite');
  }
  if (!Number.isFinite(step) || step <= 0) {
    throw new RangeError('step must be positive and finite');
  }

  if (key === 'Home') return 0;
  if (key === 'End') return 100;

  let delta = 0;
  if (key === 'ArrowLeft' || key === 'ArrowDown') delta = -step;
  if (key === 'ArrowRight' || key === 'ArrowUp') delta = step;
  if (delta === 0) return current;

  return Math.min(Math.max(current + delta, 0), 100);
}
