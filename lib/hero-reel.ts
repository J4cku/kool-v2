// Pure gesture math for the homepage reel: horizontal input advances the
// reel, vertical input must always fall through to normal page scroll.

export const HORIZONTAL_WHEEL_THRESHOLD = 12;
export const HORIZONTAL_SWIPE_THRESHOLD = 40;

function assertFinite(value: number, name: string) {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite`);
  }
}

// True when a wheel event is a deliberate horizontal gesture — the caller
// preventDefaults these (blocking browser history swipes) and lets everything
// else scroll the document.
export function isHorizontalWheelIntent(
  deltaX: number,
  deltaY: number,
  minDelta = 2,
) {
  assertFinite(deltaX, 'deltaX');
  assertFinite(deltaY, 'deltaY');
  return Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= minDelta;
}

export function getHorizontalWheelStep(
  deltaX: number,
  deltaY: number,
  threshold = HORIZONTAL_WHEEL_THRESHOLD,
) {
  assertFinite(deltaX, 'deltaX');
  assertFinite(deltaY, 'deltaY');
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return 0;
  if (Math.abs(deltaX) < threshold) return 0;
  return deltaX > 0 ? 1 : -1;
}

export function normalizeWheelDelta(
  delta: number,
  deltaMode: number,
  pageSize: number,
) {
  assertFinite(delta, 'delta');
  assertFinite(deltaMode, 'deltaMode');
  assertFinite(pageSize, 'pageSize');

  if (deltaMode === 1) return delta * 16;
  if (deltaMode === 2) return delta * pageSize;
  return delta;
}

export function accumulateHorizontalWheel(
  accumulatedDeltaX: number,
  deltaX: number,
  deltaY: number,
  threshold = HORIZONTAL_WHEEL_THRESHOLD,
) {
  assertFinite(accumulatedDeltaX, 'accumulatedDeltaX');
  assertFinite(deltaX, 'deltaX');
  assertFinite(deltaY, 'deltaY');

  if (!isHorizontalWheelIntent(deltaX, deltaY, Number.EPSILON)) {
    return { deltaX: 0, step: 0, handled: false };
  }

  const nextDeltaX = accumulatedDeltaX + deltaX;
  const step = getHorizontalWheelStep(nextDeltaX, 0, threshold);

  return {
    deltaX: step === 0 ? nextDeltaX : 0,
    step,
    handled: true,
  };
}

// deltaX/deltaY are start minus end: a leftward swipe yields positive deltaX
// and advances to the next project.
export function getHorizontalSwipeStep(
  deltaX: number,
  deltaY: number,
  threshold = HORIZONTAL_SWIPE_THRESHOLD,
) {
  assertFinite(deltaX, 'deltaX');
  assertFinite(deltaY, 'deltaY');
  if (Math.abs(deltaX) <= Math.abs(deltaY)) return 0;
  if (deltaX >= threshold) return 1;
  if (deltaX <= -threshold) return -1;
  return 0;
}
