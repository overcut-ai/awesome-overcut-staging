export function clamp(value: number, min: number, max: number): number {
  const lowerBound = Math.min(min, max);
  const upperBound = Math.max(min, max);

  if (value < lowerBound) {
    return lowerBound;
  }

  if (value > upperBound) {
    return upperBound;
  }

  return value;
}
