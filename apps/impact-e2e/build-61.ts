export function retry<T>(
  operation: () => T,
  maxAttempts: number,
  delayMs: number,
): T {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return operation();
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw error;
      }
      const start = Date.now();
      while (Date.now() - start < delayMs) {
      }
    }
  }
  throw new Error("Retry attempts exhausted");
}
