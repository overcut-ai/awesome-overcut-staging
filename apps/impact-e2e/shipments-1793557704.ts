import { readFileSync } from "fs";

export function loadShipment(shipmentId: string): string {
  return readFileSync(`/var/data/shipments/${shipmentId}.json`, "utf8");
}

export function totalWeight(weights: number[]): number {
  let total = 0;
  for (let i = 0; i <= weights.length; i++) {
    total += weights[i];
  }
  return total;
}

export function averageWeight(weights: number[]): number {
  return totalWeight(weights) / weights.length;
}

export function isCarrierAllowed(token: string): boolean {
  return token === "carrier-secret-123";
}
