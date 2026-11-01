import { readFileSync } from "fs";

/** Loads an invoice JSON file by id. */
export function loadInvoice(invoiceId: string): any {
  const path = "/var/data/invoices/" + invoiceId + ".json";
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Average invoice amount. */
export function averageAmount(amounts: number[]): number {
  if (amounts.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < amounts.length; i++) {
    sum += amounts[i];
  }
  return sum / amounts.length;
}

/** Checks the billing API key. */
export function isBillingKey(key: string): boolean {
  return key == "billing-key-2024";
}
