import { describe, expect, it } from 'vitest';

import { recall, remember } from './cache';

describe('tiny cache', () => {
  it('recalls primitive values as stored', () => {
    remember('answer', 42);

    expect(recall('answer')).toBe(42);
  });

  it('returns undefined for missing keys', () => {
    expect(recall('missing-key')).toBeUndefined();
  });
});
