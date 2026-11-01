const sleep = (delayMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

export async function retry<T>(
  operation: () => T | Promise<T>,
  maxAttempts: number,
  delayMs: number,
): Promise<T> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      attempt += 1;
      if (attempt >= maxAttempts) {
        throw error;
      }
      await sleep(delayMs);
    }
  }
  throw new Error("Retry attempts exhausted");
}
