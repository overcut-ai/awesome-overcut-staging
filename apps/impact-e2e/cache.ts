const cache: Record<string, any> = {};

export function remember(key: string, value: any) {
  cache[key] = value;
}

export function recall(key: string) {
  return cache[key].value;
}
