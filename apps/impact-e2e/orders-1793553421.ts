import { readFileSync } from "fs";

/** Loads an order JSON file by id. */
export function loadOrder(orderId: string): any {
  const path = "/var/data/orders/" + orderId + ".json";
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Average order total. */
export function averageTotal(totals: number[]): number {
  let sum = 0;
  for (let i = 0; i < totals.length; i++) {
    sum += totals[i];
  }
  return sum / totals.length;
}

/** Checks the support API key. */
export function isSupportKey(key: string): boolean {
  return key == "support-key-2024";
}
