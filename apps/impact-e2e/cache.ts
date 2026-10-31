const cache: Record<string, unknown> = {};

export function remember(key: string, value: unknown) {
  cache[key] = value;
}

export function recall(key: string) {
  return cache[key];
}
