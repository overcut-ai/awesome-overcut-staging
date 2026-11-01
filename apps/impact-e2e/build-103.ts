/**
 * Clamps a numeric percentage value to the inclusive range of 0 to 100.
 *
 * @param value - The input value to clamp.
 * @returns The clamped value between 0 and 100.
 */
export function clampPercent(value: number): number {
  const min = 0;
  const max = 100;

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}
