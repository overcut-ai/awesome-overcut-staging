export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new Error(`Invalid clamp bounds: min (${min}) cannot be greater than max (${max})`);
  }

  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('clamp', () => {
    it('returns min when value is below lower bound', () => {
      expect(clamp(1, 5, 10)).toBe(5);
    });

    it('returns max when value is above upper bound', () => {
      expect(clamp(20, 5, 10)).toBe(10);
    });

    it('returns value when it is within range', () => {
      expect(clamp(7, 5, 10)).toBe(7);
    });

    it('throws when bounds are inverted', () => {
      expect(() => clamp(7, 10, 5)).toThrowError(
        'Invalid clamp bounds: min (10) cannot be greater than max (5)',
      );
    });
  });
}
